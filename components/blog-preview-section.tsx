import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { cleanTitle } from "@/app/blog/[slug]/page";

interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  slug: string;
  categories: number[];
  featured_media: number;
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      medium?: {
        source_url: string;
        width: number;
        height: number;
      };
      thumbnail?: {
        source_url: string;
        width: number;
        height: number;
      };
      medium_large?: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

// Helper function to fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000,
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && retries > 0) {
      // Too many requests, wait and retry
      console.log(
        `Rate limited (429). Retrying in ${delay}ms. Retries left: ${retries}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
    }

    return response; // Return the error response if we can't retry
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Fetch error. Retrying in ${delay}ms. Retries left: ${retries}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function fetchLatestPosts(): Promise<WordPressPost[]> {
  try {
    const response = await fetchWithRetry(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?per_page=3",

      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    );

    if (!response.ok) {
      console.error(
        `WordPress API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.error("Empty response from WordPress API");
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Failed to parse WordPress API response:",
        text.substring(0, 100),
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

async function fetchCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetchWithRetry(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/categories",
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    );

    if (!response.ok) {
      console.error(
        `WordPress API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.error("Empty response from WordPress API");
      return [];
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Failed to parse WordPress API response:",
        text.substring(0, 100),
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function fetchMediaById(mediaId: number): Promise<WordPressMedia | null> {
  if (!mediaId) return null;

  try {
    const response = await fetchWithRetry(
      `https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/media/${mediaId}`,
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    );

    if (!response.ok) {
      console.error(
        `WordPress API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const text = await response.text();
    if (!text) {
      console.error("Empty response from WordPress API");
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Failed to parse WordPress API response:",
        text.substring(0, 100),
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching media:", error);
    return null;
  }
}

// Process posts in batches to avoid rate limiting
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize = 2,
  delayMs = 1500,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);

    // Add delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

function extractFirstImageFromContent(
  content: string,
): { src: string; alt: string } | null {
  // Create a temporary DOM element to parse HTML
  if (typeof window === "undefined") {
    // Server-side: use regex to extract first image
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*(?:alt="([^">]*)")?[^>]*>/i;
    const match = content.match(imgRegex);

    if (match) {
      return {
        src: match[1],
        alt: match[2] || "Blog post image",
      };
    }
    return null;
  }

  // Client-side: use DOM parsing
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;
  const firstImg = tempDiv.querySelector("img");

  if (firstImg && firstImg.src) {
    return {
      src: firstImg.src,
      alt: firstImg.alt || "Blog post image",
    };
  }

  return null;
}

async function fetchPostsWithMedia(): Promise<
  (WordPressPost & {
    featuredImage?: WordPressMedia;
    contentImage?: { src: string; alt: string };
  })[]
> {
  const posts = await fetchLatestPosts();

  // Process posts in batches to avoid rate limiting
  const postsWithMedia = await processBatch(
    posts,
    async (post) => {
      let featuredImage: WordPressMedia | undefined;
      let contentImage: { src: string; alt: string } | undefined;

      // Try to get featured image first
      if (post.featured_media) {
        const media = await fetchMediaById(post.featured_media);
        if (media) {
          featuredImage = media;
        }
      }

      // If no featured image, extract first image from content
      if (!featuredImage && post.content?.rendered) {
        const extractedImage = extractFirstImageFromContent(
          post.content.rendered,
        );
        if (extractedImage) {
          contentImage = extractedImage;
        }
      }

      return { ...post, featuredImage, contentImage };
    },
    2, // Process 2 posts at a time
    1500, // Wait 1.5 seconds between batches
  );

  return postsWithMedia;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getOptimalImageUrl(media: WordPressMedia): string {
  // Prefer medium size, fallback to medium_large, then original
  if (media.media_details?.sizes?.medium?.source_url) {
    return media.media_details.sizes.medium.source_url;
  }
  if (media.media_details?.sizes?.medium_large?.source_url) {
    return media.media_details.sizes.medium_large.source_url;
  }
  return media.source_url;
}

async function BlogPreviewContent() {
  // Fetch data with error handling
  let postsWithMedia: (WordPressPost & {
    featuredImage?: WordPressMedia;
    contentImage?: { src: string; alt: string };
  })[] = [];

  let categories: WordPressCategory[] = [];

  try {
    [postsWithMedia, categories] = await Promise.all([
      fetchPostsWithMedia(),
      fetchCategories(),
    ]);
  } catch (error) {
    console.error("Error fetching blog preview data:", error);
    // Continue with empty arrays if there's an error
  }

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Filter categories that have posts
  const activeCategories = categories
    .filter((cat) => cat.count > 0)
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          From Our Blog
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Discover productivity tips, insights, and updates from our team
        </p>
        <Button size="lg" asChild className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Visit Our Blog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Latest Posts */}
      {postsWithMedia.length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Latest Posts
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {postsWithMedia.map((post) => {
              const imageUrl = post.featuredImage
                ? getOptimalImageUrl(post.featuredImage)
                : post.contentImage?.src;

              const imageAlt =
                post.featuredImage?.alt_text ||
                post.contentImage?.alt ||
                cleanTitle(post.title.rendered);

              return (
                <article key={post.id}>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Featured Image or Content Image */}
                    {imageUrl ? (
                      <div className="aspect-video relative overflow-hidden">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={imageAlt}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video relative bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.categories.slice(0, 2).map((categoryId) => (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getCategoryName(categoryId)}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {cleanTitle(post.title.rendered)}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        <time dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div
                        className="text-muted-foreground line-clamp-3 flex-1 mb-4 text-sm"
                        dangerouslySetInnerHTML={{
                          __html:
                            post.excerpt.rendered.substring(0, 120) + "...",
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {activeCategories.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Explore Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {activeCategories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-foreground mb-1">
                    {category.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.count} {category.count === 1 ? "post" : "posts"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/blog?category=${category.slug}`}>
                      Explore
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlogPreviewSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="h-10 bg-muted rounded w-64 mx-auto mb-4"></div>
        <div className="h-6 bg-muted rounded w-96 mx-auto mb-8"></div>
        <div className="h-12 bg-muted rounded w-40 mx-auto"></div>
      </div>

      <div className="mb-12">
        <div className="h-8 bg-muted rounded w-48 mb-6"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow overflow-hidden">
              <div className="aspect-video bg-muted"></div>
              <div className="p-6">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-6 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="h-8 bg-muted rounded w-56 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-4 shadow text-center">
              <div className="h-5 bg-muted rounded w-full mb-1"></div>
              <div className="h-4 bg-muted rounded w-16 mx-auto mb-3"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogPreviewSection() {
  return (
    <section className="py-16 px-4 bg-background">
      <Suspense fallback={<BlogPreviewSkeleton />}>
        <BlogPreviewContent />
      </Suspense>
    </section>
  );
}
