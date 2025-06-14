import type { Metadata } from "next";
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
import { ArrowLeft, BookOpen } from "lucide-react";

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
  link: string;
  slug: string;
  categories: number[];
  featured_media: number;
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
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

function cleanTitle(html: string): string {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s+/g, " "); // Replace multiple spaces with single space
}

export const metadata: Metadata = {
  title:
    "Creative Productivity Blog - Design Workflow Tips & Clipboard Management | Clipbored",
  description:
    "Discover productivity tips for designers, creative workflow optimization strategies, and insights on using clipboard managers with Figma, Notion, and Excalidraw. Learn how to organize design assets efficiently.",
  keywords: [
    "design workflow tips",
    "creative productivity blog",
    "clipboard management for designers",
    "Figma workflow optimization",
    "Notion productivity tips",
    "design asset organization",
    "creative professional tips",
    "workflow management blog",
    "design productivity insights",
    "creative tools tutorials",
  ],
  openGraph: {
    title: "Creative Productivity Blog - Design Workflow Tips | Clipbored",
    description:
      "Discover productivity tips for designers, creative workflow optimization strategies, and insights on using clipboard managers with creative tools.",
    url: "https://www.clipbo.redblog",
    images: [
      {
        url: "/og-blog.jpg",
        width: 1200,
        height: 630,
        alt: "Clipbored Blog - Creative productivity tips and design workflow insights",
      },
    ],
  },
  alternates: {
    canonical: "https://www.clipbo.redblog",
  },
};

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

async function fetchPosts(): Promise<WordPressPost[]> {
  try {
    const response = await fetchWithRetry(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?per_page=10",
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
    console.error("Error fetching posts:", error);
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

function extractFirstImageFromContent(
  content: string,
): { src: string; alt: string } | null {
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

// Process posts in batches to avoid rate limiting
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize = 3,
  delayMs = 1000,
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

async function fetchPostsWithMedia(): Promise<
  (WordPressPost & {
    featuredImage?: WordPressMedia;
    contentImage?: { src: string; alt: string };
  })[]
> {
  const posts = await fetchPosts();

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
    3, // Process 3 posts at a time
    1000, // Wait 1 second between batches
  );

  return postsWithMedia;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
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

async function BlogContent({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
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
    console.error("Error fetching blog data:", error);
    // Continue with empty arrays if there's an error
  }

  const selectedCategory = searchParams.category;

  // Filter posts by category if specified - this now happens after fetching all posts
  const filteredPosts = selectedCategory
    ? postsWithMedia.filter((post) => {
        const categoryNames = post.categories.map((categoryId) => {
          const category = categories.find((cat) => cat.id === categoryId);
          return category?.slug || "";
        });
        return categoryNames.includes(selectedCategory);
      })
    : postsWithMedia;

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Clipbored Creative Productivity Blog",
    description:
      "Productivity tips, design workflow optimization strategies, and insights for creative professionals using clipboard managers and productivity tools.",
    url: "https://www.clipbo.redblog",
    publisher: {
      "@type": "Organization",
      name: "Clipbored",
      logo: {
        "@type": "ImageObject",
        url: "https://www.clipbo.redlogo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.clipbo.redblog",
    },
    blogPost: filteredPosts.map((post) => {
      const imageUrl = post.featuredImage
        ? getOptimalImageUrl(post.featuredImage)
        : post.contentImage?.src;

      return {
        "@type": "BlogPosting",
        headline: cleanTitle(post.title.rendered),
        description: stripHtml(post.excerpt.rendered),
        url: `https://www.clipbo.redblog/${post.slug}`,
        datePublished: post.date,
        image: imageUrl,
        author: {
          "@type": "Organization",
          name: "Clipbored",
        },
        publisher: {
          "@type": "Organization",
          name: "Clipbored",
          logo: {
            "@type": "ImageObject",
            url: "https://www.clipbo.redlogo.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.clipbo.redblog/${post.slug}`,
        },
      };
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.clipbo.red",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://www.clipbo.redblog",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">Blog</li>
            </ol>
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Creative Productivity Blog
          </h1>
          <p className="text-muted-foreground text-lg">
            Design workflow tips, productivity insights, and creative tool
            tutorials for designers and creative professionals
          </p>
        </div>

        {categories.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Explore Topics</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/blog">
                <Badge
                  variant={!selectedCategory ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                >
                  All Posts
                </Badge>
              </a>
              {categories.map((category) => (
                <a key={category.id} href={`/blog?category=${category.slug}`}>
                  <Badge
                    variant={
                      selectedCategory === category.slug ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                  >
                    {category.name}
                  </Badge>
                </a>
              ))}
            </div>
            {selectedCategory && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing posts in category:{" "}
                <span className="font-medium">
                  {categories.find((cat) => cat.slug === selectedCategory)
                    ?.name || selectedCategory}
                </span>
              </div>
            )}
          </section>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No blog posts available at the moment.
            </p>
            <p className="text-muted-foreground mt-2">
              Check back soon for creative productivity tips and design workflow
              insights!
            </p>
          </div>
        ) : (
          <main className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
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
                        {post.categories.map((categoryId) => (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getCategoryName(categoryId)}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="line-clamp-2">
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
                        className="text-muted-foreground line-clamp-3 flex-1 mb-4"
                        dangerouslySetInnerHTML={{
                          __html:
                            post.excerpt.rendered.substring(0, 150) + "...",
                        }}
                      />
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </main>
        )}
      </div>
    </>
  );
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-lg shadow overflow-hidden"
                  >
                    <div className="aspect-video bg-muted"></div>
                    <div className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-20 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <BlogContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
