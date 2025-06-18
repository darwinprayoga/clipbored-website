import type { MetadataRoute } from "next";

interface WordPressPost {
  id: number;
  slug: string;
  date: string;
}

async function fetchPosts(): Promise<WordPressPost[]> {
  try {
    const response = await fetch(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts",
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error(
        "Error fetching posts for sitemap:",
        response.status,
        response.statusText,
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
        "Failed to parse WordPress API response for sitemap:",
        text.substring(0, 100),
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts();

  const staticPages = [
    {
      url: "https://www.clipbo.red/",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: "https://www.clipbo.red/blog",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: "https://clipbo.red/",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
  ];

  const blogPosts = posts.map((post) => ({
    url: `https://www.clipbo.red/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPosts];
}
