import type { MetadataRoute } from "next";

interface WordPressPost {
  id: number;
  slug: string;
  date: string;
}

async function fetchPosts(): Promise<WordPressPost[]> {
  try {
    const response = await fetch(
      "https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?per_page=100",
      {
        // This enables static generation with revalidation every hour
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error("Error fetching posts:", response.statusText);
      return [];
    }

    return await response.json();
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
      priority: 1.0,
    },
    {
      url: "https://www.clipbo.red/blog",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
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
