// app/sitemap.xml/route.ts

import { NextResponse } from "next/server";

interface WordPressPost {
  id: number;
  slug: string;
  date: string;
}

async function fetchPosts(): Promise<WordPressPost[]> {
  const allPosts: WordPressPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/clipboredcom.wordpress.com/posts?per_page=100&page=${page}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) break;

    const posts = await res.json();
    allPosts.push(...posts);

    hasMore = posts.length === 100;
    page++;
  }

  return allPosts;
}

export async function GET() {
  const posts = await fetchPosts();

  const baseUrl = "https://www.clipbo.red";

  const staticUrls = [
    { loc: `${baseUrl}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${baseUrl}/blog`, changefreq: "daily", priority: "0.8" },
  ];

  const postUrls = posts.map((post) => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    lastmod: new Date(post.date).toISOString(),
    changefreq: "monthly",
    priority: "0.6",
  }));

  const allUrls = [...staticUrls, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allUrls
      .map((url: any) => {
        return `
      <url>
        <loc>${url.loc}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>`;
      })
      .join("")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
