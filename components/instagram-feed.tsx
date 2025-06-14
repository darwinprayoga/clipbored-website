import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

// This would normally fetch from Instagram API
// For now, using placeholder data
async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  // In a real implementation, you would:
  // 1. Set up Instagram Basic Display API
  // 2. Get access token
  // 3. Make authenticated requests

  // Placeholder data for demonstration
  return [
    {
      id: "1",
      media_url: "/post-3.png",
      media_type: "IMAGE",
      caption:
        "Discover Your Personal KHODAM! 🌟 Dive into the mystical world and find your guardian spirit. Visit our website now! ✨🔮 by typing [ prayoga.io/khodam ] on everywhere",
      permalink: "https://www.instagram.com/p/C8oAX0dyUlP/",
      timestamp: "2024-06-25T10:00:00Z",
      like_count: 317,
      comments_count: 5,
    },
    {
      id: "2",
      media_url: "/post-2.png",
      media_type: "IMAGE",
      caption:
        "Step into @prayoga.io the new world of ___ and let's embark on an epic journey together!",
      permalink: "https://www.instagram.com/p/C5sihmprXvP/",
      timestamp: "2024-04-13T09:15:00Z",
      like_count: 562,
      comments_count: 3,
    },
    {
      id: "3",
      media_url: "/post-1.png",
      media_type: "IMAGE",
      caption:
        "Are you looking for a new world? feel the excitement and discover your Extreme Path within @prayoga.io",
      permalink: "https://www.instagram.com/p/C5Xh5V8Pc3q/",
      timestamp: "2024-04-05T09:15:00Z",
      like_count: 740,
      comments_count: 8,
    },
  ];
}

function formatInstagramDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}

function truncateCaption(caption: string, maxLength = 60): string {
  if (caption.length <= maxLength) return caption;
  return caption.substring(0, maxLength) + "...";
}

async function InstagramFeedContent() {
  const posts = await fetchInstagramPosts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:shadow-lg transition-all duration-300"
        >
          <Image
            src={post.media_url || "/placeholder.svg"}
            alt={post.caption || "Instagram post"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center p-3">
              <div className="flex items-center justify-center gap-4 mb-2">
                {post.like_count && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{post.like_count}</span>
                  </div>
                )}
                {post.comments_count && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments_count}</span>
                  </div>
                )}
              </div>
              {post.caption && (
                <p className="text-xs leading-tight">
                  {truncateCaption(post.caption)}
                </p>
              )}
              <div className="flex items-center justify-center mt-2">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Time indicator */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {formatInstagramDate(post.timestamp)}
          </div>
        </Link>
      ))}
    </div>
  );
}

function InstagramFeedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-200 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export default function InstagramFeed() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Latest from Instagram</h3>
        <Link
          href="https://www.instagram.com/prayoga.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
        >
          @prayoga.io
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <Suspense fallback={<InstagramFeedSkeleton />}>
        <InstagramFeedContent />
      </Suspense>
    </div>
  );
}
