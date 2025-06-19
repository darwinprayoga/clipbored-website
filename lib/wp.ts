export interface WordPressPost {
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

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressMedia {
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

const SITE_URL =
  "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com";

export async function fetchPostBySlug(
  slug: string,
): Promise<WordPressPost | null> {
  try {
    const res = await fetch(`${SITE_URL}/posts?slug=${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<WordPressCategory[]> {
  try {
    const res = await fetch(`${SITE_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchMediaById(
  mediaId: number,
): Promise<WordPressMedia | null> {
  if (!mediaId) return null;
  try {
    const res = await fetch(`${SITE_URL}/media/${mediaId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching media:", error);
    return null;
  }
}

export function extractFirstImageFromContent(
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
    .replace(/\s+/g, " ");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function getOptimalImageUrl(media: WordPressMedia): string {
  return (
    media.media_details?.sizes?.large?.source_url ||
    media.media_details?.sizes?.medium_large?.source_url ||
    media.media_details?.sizes?.medium?.source_url ||
    media.source_url
  );
}
