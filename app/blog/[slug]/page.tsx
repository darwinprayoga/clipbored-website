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
      { next: { revalidate: 3600 } },
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
      {
        next: { revalidate: 3600 },
      },
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
      { next: { revalidate: 3600 } },
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
  let ogImage = "/og-image.png";

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Post Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
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
    image: imageUrl || "/og-image.png",
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
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 dark:text-gray-100 truncate">
                {cleanTitle(post.title.rendered)}
              </li>
            </ol>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
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

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {cleanTitle(post.title.rendered)}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none 
    prose-headings:text-gray-900 prose-headings:font-bold
    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
    prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
    prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5
    prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
    prose-strong:text-gray-900 prose-strong:font-semibold
    prose-em:text-gray-800 prose-em:italic
    prose-ul:my-4 prose-ul:pl-6
    prose-ol:my-4 prose-ol:pl-6
    prose-li:mb-2 prose-li:text-gray-700
    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
    prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
    prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
    prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
    prose-hr:border-gray-300 prose-hr:my-8
    prose-table:border-collapse prose-table:border prose-table:border-gray-300
    prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-2 prose-th:font-semibold
    prose-td:border prose-td:border-gray-300 prose-td:p-2
    dark:prose-headings:text-white
    dark:prose-h2:border-gray-700
    dark:prose-p:text-gray-300
    dark:prose-li:text-gray-300
    dark:prose-strong:text-white
    dark:prose-em:text-gray-200
    dark:prose-blockquote:text-gray-400 dark:prose-blockquote:border-gray-600
    dark:prose-code:bg-gray-800 dark:prose-code:text-gray-200
    dark:prose-pre:bg-gray-800 dark:prose-pre:text-gray-100
    dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300
    dark:prose-hr:border-gray-700
    dark:prose-th:border-gray-600 dark:prose-th:bg-gray-800 dark:prose-th:text-gray-200
    dark:prose-td:border-gray-600 dark:prose-td:text-gray-300
    dark:prose-table:border-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <Link
              href="https://clipbo.red/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                GO TO APP
                <ExternalLink className="w-4 h-4 ml-2" />
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
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSkeleton />}>
        <PostContent slug={params.slug} />
      </Suspense>
    </div>
  );
}
