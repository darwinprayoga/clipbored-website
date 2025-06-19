import type { Metadata } from "next";
import {
  fetchPostBySlug,
  fetchMediaById,
  extractFirstImageFromContent,
  cleanTitle,
} from "@/lib/wp";

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
