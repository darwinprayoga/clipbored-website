import type React from "react";
import type { Metadata } from "next";
import { Source_Sans_3 as Source_Sans_Pro } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";

const sourceSansPro = Source_Sans_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.clipbo.red"),
  title: {
    default:
      "Clipbored - Smart Clipboard Manager for Designers & Creative Professionals",
    template: "%s | Clipbored - Creative Productivity Tools",
  },
  description:
    "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw. Organize design assets, manage creative workflows, and boost productivity with smart clipboard tools built for creative professionals.",
  keywords: [
    "clipboard manager for designers",
    "to-do and clipboard app for productivity",
    "best clipboard tool for Notion and Figma users",
    "clipboard with tasks for Excalidraw workflows",
    "creative workflow clipboard organizer",
    "design asset management",
    "Figma clipboard tool",
    "Notion companion tools",
    "creative professional productivity",
    "design workflow optimization",
    "clipboard app for creatives",
    "task management for designers",
    "creative productivity tools",
    "design asset organizer",
    "workflow management for creatives",
  ],
  authors: [{ name: "Clipbored Team", url: "https://www.clipbo.red" }],
  creator: "Clipbored",
  publisher: "Clipbored",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.clipbo.red",
    siteName: "Clipbored - Creative Productivity Tools",
    title:
      "Clipbored - Smart Clipboard Manager for Designers & Creative Professionals",
    description:
      "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw. Organize design assets and boost creative productivity.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clipbored - Smart clipboard manager for designers and creative professionals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clipbored - Smart Clipboard Manager for Designers",
    description:
      "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw.",
    images: ["/og-image.jpg"],
    creator: "@clipbored",
    site: "@clipbored",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "Productivity Software",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://www.clipbo.red" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Clipbored" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={sourceSansPro.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <Analytics />
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Clipbored",
              url: "https://www.clipbo.red",
              logo: "https://www.clipbo.red/logo.png",
              description:
                "Smart clipboard manager and productivity tools designed specifically for designers and creative professionals.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "hello@clipbored.com",
                contactType: "customer service",
              },
              sameAs: [
                "https://twitter.com/clipbored",
                "https://instagram.com/prayoga.io",
                "https://github.com/clipbored",
                "https://discord.gg/clipbored",
              ],
              foundingDate: "2024",
              founders: [
                {
                  "@type": "Person",
                  name: "Clipbored Team",
                },
              ],
              knowsAbout: [
                "Clipboard Management",
                "Design Workflows",
                "Creative Productivity",
                "Figma Integration",
                "Notion Companion Tools",
                "Task Management for Designers",
              ],
              areaServed: "Worldwide",
              serviceType: "Productivity Software",
            }),
          }}
        />
      </body>
    </html>
  );
}
