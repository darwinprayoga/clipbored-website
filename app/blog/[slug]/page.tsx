import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  link: string;
  slug: string;
  categories: number[];
  author: number;
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
      large?: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export function cleanTitle(html: string): string {
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

async function fetchPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const response = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?slug=${slug}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }
    const posts = await response.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

async function fetchCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/categories",
      { cache: "no-store" },
    );
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function fetchMediaById(mediaId: number): Promise<WordPressMedia | null> {
  if (!mediaId) return null;

  try {
    const response = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/media/${mediaId}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Clipbored Blog",
      description: "The blog post you are looking for could not be found.",
    };
  }

  const title = cleanTitle(post.title.rendered);
  const description = post.excerpt.rendered
    .replace(/<[^>]*>/g, "")
    .substring(0, 160);

  // Try to get an image for Open Graph
  let ogImage = "/og-blog-post.jpg";

  if (post.featured_media) {
    const featuredImage = await fetchMediaById(post.featured_media);
    if (featuredImage) {
      ogImage = featuredImage.source_url;
    }
  } else if (post.content?.rendered) {
    const contentImage = extractFirstImageFromContent(post.content.rendered);
    if (contentImage) {
      ogImage = contentImage.src;
    }
  }

  return {
    title: `${title} | Clipbored Blog`,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.clipbo.red/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: ["Clipbored Team"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://www.clipbo.red/blog/${post.slug}`,
    },
  };
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
  // Prefer large size, fallback to medium_large, medium, then original
  if (media.media_details?.sizes?.large?.source_url) {
    return media.media_details.sizes.large.source_url;
  }
  if (media.media_details?.sizes?.medium_large?.source_url) {
    return media.media_details.sizes.medium_large.source_url;
  }
  if (media.media_details?.sizes?.medium?.source_url) {
    return media.media_details.sizes.medium.source_url;
  }
  return media.source_url;
}

async function PostContent({ slug }: { slug: string }) {
  const [post, categories] = await Promise.all([
    fetchPostBySlug(slug),
    fetchCategories(),
  ]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Post Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Get image data for metadata only (not for display)
  let featuredImage: WordPressMedia | null = null;
  let contentImage: { src: string; alt: string } | null = null;

  if (post.featured_media) {
    featuredImage = await fetchMediaById(post.featured_media);
  }

  if (!featuredImage && post.content?.rendered) {
    contentImage = extractFirstImageFromContent(post.content.rendered);
    contentImage = contentImage
      ? { ...contentImage, alt: cleanTitle(post.title.rendered) }
      : null;
  }

  const imageUrl = featuredImage
    ? getOptimalImageUrl(featuredImage)
    : contentImage?.src;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: cleanTitle(post.title.rendered),
    description: stripHtml(post.excerpt.rendered),
    image: imageUrl || "/og-blog-post.jpg",
    author: {
      "@type": "Organization",
      name: "Clipbored",
    },
    publisher: {
      "@type": "Organization",
      name: "Clipbored",
      logo: {
        "@type": "ImageObject",
        url: "https://www.clipbo.red/logo.png",
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.clipbo.red/blog/${post.slug}`,
    },
    url: `https://www.clipbo.red/blog/${post.slug}`,
    articleSection: post.categories
      .map((categoryId) => getCategoryName(categoryId))
      .join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 truncate">
                {cleanTitle(post.title.rendered)}
              </li>
            </ol>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((categoryId) => (
              <Badge key={categoryId} variant="secondary">
                {getCategoryName(categoryId)}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {cleanTitle(post.title.rendered)}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSkeleton />}>
        <PostContent slug={params.slug} />
      </Suspense>
    </div>
  );
}
