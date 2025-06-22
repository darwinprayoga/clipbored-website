"use client";

import { useState, useEffect } from "react";
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
import { BookOpen, Loader2 } from "lucide-react";

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

interface PostWithMedia extends WordPressPost {
  featuredImage?: WordPressMedia;
  contentImage?: { src: string; alt: string };
}

const POSTS_PER_PAGE = 6;

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
    .replace(/\s+/g, " ");
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
  if (media.media_details?.sizes?.medium?.source_url) {
    return media.media_details.sizes.medium.source_url;
  }
  if (media.media_details?.sizes?.medium_large?.source_url) {
    return media.media_details.sizes.medium_large.source_url;
  }
  return media.source_url;
}

function extractFirstImageFromContent(
  content: string,
): { src: string; alt: string } | null {
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
      console.log(
        `Rate limited (429). Retrying in ${delay}ms. Retries left: ${retries}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    return response;
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

async function fetchPosts(
  page = 1,
  perPage = POSTS_PER_PAGE,
): Promise<{
  posts: WordPressPost[];
  totalPages: number;
  totalPosts: number;
}> {
  try {
    const response = await fetchWithRetry(
      `https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?page=${page}&per_page=${perPage}&_embed=1`,
    );

    if (!response.ok) {
      console.error(
        `WordPress API error: ${response.status} ${response.statusText}`,
      );
      return { posts: [], totalPages: 0, totalPosts: 0 };
    }

    const posts = await response.json();
    const totalPosts = Number.parseInt(
      response.headers.get("X-WP-Total") || "0",
    );
    const totalPages = Number.parseInt(
      response.headers.get("X-WP-TotalPages") || "0",
    );

    return { posts, totalPages, totalPosts };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], totalPages: 0, totalPosts: 0 };
  }
}

async function fetchCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetchWithRetry(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/categories",
    );

    if (!response.ok) {
      console.error(
        `WordPress API error: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    return await response.json();
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
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching media:", error);
    return null;
  }
}

async function processPostsWithMedia(
  posts: WordPressPost[],
): Promise<PostWithMedia[]> {
  const postsWithMedia = await Promise.all(
    posts.map(async (post) => {
      let featuredImage: WordPressMedia | undefined;
      let contentImage: { src: string; alt: string } | undefined;

      if (post.featured_media) {
        const media = await fetchMediaById(post.featured_media);
        if (media) {
          featuredImage = media;
        }
      }

      if (!featuredImage && post.content?.rendered) {
        const extractedImage = extractFirstImageFromContent(
          post.content.rendered,
        );
        if (extractedImage) {
          contentImage = extractedImage;
        }
      }

      return { ...post, featuredImage, contentImage };
    }),
  );

  return postsWithMedia;
}

export function BlogContent({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [posts, setPosts] = useState<PostWithMedia[]>([]);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = searchParams.category;

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);

      try {
        const [postsData, categoriesData] = await Promise.all([
          fetchPosts(1, POSTS_PER_PAGE),
          fetchCategories(),
        ]);

        const processedPosts = await processPostsWithMedia(postsData.posts);

        setPosts(processedPosts);
        setCategories(categoriesData);
        setTotalPages(postsData.totalPages);
        setTotalPosts(postsData.totalPosts);
        setCurrentPage(1);
      } catch (err) {
        setError("Failed to load blog posts. Please try again later.");
        console.error("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [selectedCategory]);

  // Load more posts
  const loadMorePosts = async () => {
    if (loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const postsData = await fetchPosts(nextPage, POSTS_PER_PAGE);
      const processedPosts = await processPostsWithMedia(postsData.posts);

      setPosts((prevPosts) => [...prevPosts, ...processedPosts]);
      setCurrentPage(nextPage);
    } catch (err) {
      setError("Failed to load more posts. Please try again.");
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter posts by category
  const filteredPosts = selectedCategory
    ? posts.filter((post) => {
        const categoryNames = post.categories.map((categoryId) => {
          const category = categories.find((cat) => cat.id === categoryId);
          return category?.slug || "";
        });
        return categoryNames.includes(selectedCategory);
      })
    : posts;

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const hasMorePosts = currentPage < totalPages;
  const showLoadMore = hasMorePosts && !selectedCategory; // Only show load more when not filtering by category

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow overflow-hidden">
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Clipbored Creative Productivity Blog",
    description:
      "Productivity tips, design workflow optimization strategies, and insights for creative professionals using clipboard managers and productivity tools.",
    url: "https://www.clipbo.red/blog",
    publisher: {
      "@type": "Organization",
      name: "Clipbored",
      logo: {
        "@type": "ImageObject",
        url: "https://www.clipbo.red/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.clipbo.red/blog",
    },
    blogPost: filteredPosts.map((post) => {
      const imageUrl = post.featuredImage
        ? getOptimalImageUrl(post.featuredImage)
        : post.contentImage?.src;

      return {
        "@type": "BlogPosting",
        headline: cleanTitle(post.title.rendered),
        description: stripHtml(post.excerpt.rendered),
        url: `https://www.clipbo.red/blog/${post.slug}`,
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
            url: "https://www.clipbo.red/logo.svg",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.clipbo.red/blog/${post.slug}`,
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        <>
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
                      <Button
                        variant="outline"
                        className="w-full min-h-12"
                        asChild
                      >
                        <Link href={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </article>
              );
            })}
          </main>

          {/* Load More Button */}
          {showLoadMore && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={loadMorePosts}
                disabled={loadingMore}
                size="lg"
                className="min-h-12 px-8"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading More Posts...
                  </>
                ) : (
                  `Load More Posts (${totalPosts - posts.length} remaining)`
                )}
              </Button>
            </div>
          )}

          {/* Posts Counter */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Showing {filteredPosts.length} of{" "}
            {selectedCategory ? filteredPosts.length : totalPosts} posts
            {!selectedCategory && totalPages > 1 && (
              <span>
                {" "}
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        </>
      )}
    </>
  );
}
