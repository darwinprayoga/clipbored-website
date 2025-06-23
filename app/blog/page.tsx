import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogContent } from "@/components/blog-content";

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
    url: "https://www.clipbo.red/blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clipbored Blog - Creative productivity tips and design workflow insights",
      },
    ],
  },
  alternates: {
    canonical: "https://www.clipbo.red/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
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

        <Suspense
          fallback={
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
          }
        >
          <BlogContent />
        </Suspense>
      </div>
    </div>
  );
}
