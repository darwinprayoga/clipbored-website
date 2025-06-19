import { Suspense } from "react";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchPostBySlug,
  fetchCategories,
  fetchMediaById,
  cleanTitle,
  extractFirstImageFromContent,
  getOptimalImageUrl,
  stripHtml,
} from "@/lib/wp";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  let featuredImage = post.featured_media
    ? await fetchMediaById(post.featured_media)
    : null;

  let contentImage =
    !featuredImage && post.content?.rendered
      ? extractFirstImageFromContent(post.content.rendered)
      : null;

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
        <nav className="mb-4 text-sm text-gray-600">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
            <li>/</li>
            <li>{cleanTitle(post.title.rendered)}</li>
          </ol>
        </nav>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
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

        <div className="text-gray-600 mb-8 flex items-center gap-4">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        <div className="mt-12 pt-8 border-t flex justify-between items-center">
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
      </article>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
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
