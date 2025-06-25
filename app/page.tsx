import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BlogPreviewSection from "@/components/blog-preview-section";
import InstagramFeed from "@/components/instagram-feed";
import TrustedByMarquee from "@/components/trusted-by-marquee";
import FAQSection from "@/components/faq-section";

export const metadata: Metadata = {
  title:
    "Clipbored - Smart Clipboard Manager for Designers & Creative Professionals",
  description:
    "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw. Organize design assets, manage creative workflows, and boost productivity with our smart clipboard tool.",
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
  ],
  openGraph: {
    title:
      "Clipbored - Smart Clipboard Manager for Designers & Creative Professionals",
    description:
      "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw. Organize design assets and boost creative productivity.",
    url: "https://www.clipbo.red",
    type: "website",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
    creator: "@prayoga.io",
  },
  alternates: {
    canonical: "https://www.clipbo.red",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Clipbored - Smart Clipboard Manager for Designers",
    description:
      "The best clipboard manager and to-do app for designers using Figma, Notion, and Excalidraw. Organize design assets and boost creative productivity.",
    url: "https://www.clipbo.red",
    mainEntity: [
      {
        "@type": "SoftwareApplication",
        name: "Clipbored Smart Clipboard",
        description:
          "Advanced clipboard manager designed specifically for designers and creative professionals working with Figma, Notion, and Excalidraw.",
        applicationCategory: "ProductivityApplication",
        operatingSystem: ["Windows", "macOS", "Web"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2024-12-31",
        },
        featureList: [
          "Smart clipboard management for design assets",
          "Integration with Figma and Notion workflows",
          "Real-time sync across devices",
          "Task management for creative projects",
          "Design asset organization",
          "Creative workflow optimization",
        ],
        screenshot: "https://www.clipbo.red/screenshot.jpg",
        author: {
          "@type": "Organization",
          name: "Clipbored",
          url: "https://www.clipbo.red",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Clipbored Minimal To-do",
        description:
          "Effortless task management built specifically for creative professionals and designers to manage their workflow without overhead.",
        applicationCategory: "ProductivityApplication",
        operatingSystem: ["Windows", "macOS", "Web"],
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          priceValidUntil: "2024-12-31",
        },
        featureList: [
          "Minimal task management for creatives",
          "Integration with design workflows",
          "Project-based organization",
          "Creative brief management",
          "Design milestone tracking",
        ],
        author: {
          "@type": "Organization",
          name: "Clipbored",
          url: "https://www.clipbo.red",
        },
      },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.clipbo.red",
        },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Clipbored help designers organize design assets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Clipbored provides smart clipboard management that automatically categorizes and organizes your design assets, making it easy to find and reuse elements across Figma, Notion, and other creative tools.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Clipbored with Figma and Notion workflows?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Clipbored is specifically designed to integrate seamlessly with popular design tools like Figma and productivity apps like Notion, helping you maintain organized workflows across platforms.",
        },
      },
      {
        "@type": "Question",
        name: "Is Clipbored suitable for creative professionals and design teams?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Clipbored is built specifically for designers, creative professionals, and design teams who need efficient clipboard management and task organization for their creative workflows.",
        },
      },
      {
        "@type": "Question",
        name: "How does the to-do feature help with creative projects?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our minimal to-do system is designed for creative workflows, allowing you to manage design briefs, track project milestones, and organize tasks without the overhead of complex project management tools.",
        },
      },
      {
        "@type": "Question",
        name: "Can I sync my clipboard across multiple devices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, with our premium features, you can sync your clipboard and tasks in real-time across all your devices - desktop, mobile, and web - ensuring your creative assets are always accessible.",
        },
      },
    ],
  };

  // Convert FAQ JSON-LD to component props
  const faqs = faqJsonLd.mainEntity.map((item) => ({
    question: item.name,
    answer: item.acceptedAnswer.text,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center text-center">
          <Image
            src="/main-cover.png"
            alt="Smart clipboard manager for designers and creative professionals"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your daily hand
            </h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto px-4">
              The best clipboard manager and to-do app to organize your daily
              workflow like never before, with Clipbored.
            </p>

            <Link href="https://prayoga.io/about">
              <Button variant="ghost" size="lg" className="min-h-12">
                More About Us
              </Button>
            </Link>
          </div>
        </section>

        {/* Navigation Categories */}
        <nav className="bg-card border-b" aria-label="Product categories">
          <div className="max-w-7xl mx-auto md:px-4 py-4 md:overflow-visible overflow-hidden">
            <div className="md:flex md:items-center md:justify-center gap-12 md:text-sm">
              {/* Desktop version - normal centered layout */}
              <div className="hidden md:flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Design">
                    📋
                  </span>{" "}
                  Journaling
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Figma">
                    👨‍💻
                  </span>{" "}
                  Multitasking
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Notion">
                    🛠️
                  </span>{" "}
                  Productive
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Lightning">
                    ⚡️
                  </span>{" "}
                  Reliable
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Folder">
                    📱
                  </span>{" "}
                  Efficient
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <span role="img" aria-label="Book">
                    📝
                  </span>{" "}
                  Organized
                </div>
              </div>

              {/* Mobile version - seamless marquee */}
              <div className="md:hidden relative overflow-hidden w-full">
                <div className="flex animate-marquee-mobile whitespace-nowrap min-w-max">
                  {[...Array(2)].map((_, repeatIndex) => (
                    <div
                      key={repeatIndex}
                      className="flex items-center space-x-6"
                      aria-hidden={repeatIndex === 1}
                    >
                      {[
                        { emoji: "📋", label: "Journaling" },
                        { emoji: "👨‍💻", label: "Multitasking" },
                        { emoji: "🛠️", label: "Productive" },
                        { emoji: "⚡️", label: "Reliable" },
                        { emoji: "📱", label: "Efficient" },
                        { emoji: "📝", label: "Organized" },
                      ].map((item, index) => (
                        <div
                          key={`${repeatIndex}-${index}`}
                          className={`flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors ${
                            index === 0 ? "ml-6" : ""
                          }`}
                        >
                          <span role="img" aria-label={item.label}>
                            {item.emoji}
                          </span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Currently Offering Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
              Built for Creative Professionals
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Designed specifically for designers, developers, and creative
              teams who use Figma, Notion, Excalidraw, and other creative tools
              daily.
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <article>
                <Card className="overflow-hidden h-full">
                  <div className="aspect-video relative">
                    <Image
                      src="/clipboard-thumbnail.png"
                      alt="Smart clipboard manager interface showing design asset organization for Figma and creative workflows"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span role="img" aria-label="Clipboard">
                        📋
                      </span>{" "}
                      Smart Clipboard
                    </CardTitle>
                    <CardDescription>
                      Quickly capture, save & reuse anything — text, links,
                      snippets & more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full min-h-12"
                      asChild
                    >
                      <Link href="https://clipbo.red">Try Clipboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              </article>

              <article>
                <Card className="overflow-hidden h-full">
                  <div className="aspect-video relative">
                    <Image
                      src="/todo-thumbnail.png"
                      alt="Minimal to-do interface designed for creative project management and design workflow organization"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span role="img" aria-label="Checkmark">
                        ✅
                      </span>{" "}
                      Minimal To-do
                    </CardTitle>
                    <CardDescription>
                      Minimal task management built to manage any briefs,
                      project milestones, and the task deadlines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full min-h-12"
                      asChild
                    >
                      <Link href="https://clipbo.red">Try To-do</Link>
                    </Button>
                  </CardContent>
                </Card>
              </article>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-primary text-primary-foreground py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-xl md:text-2xl font-medium mb-4">
              "Move fast and build things that matter. The tools you use should
              empower you to do more, not slow you down."
            </blockquote>
            <cite className="text-muted-foreground">
              — Inspired by Mark Zuckerberg
            </cite>
          </div>
        </section>

        {/* Trusted By Marquee */}
        <TrustedByMarquee />

        {/* Blog Preview Section */}
        <BlogPreviewSection />

        {/* Beta Section */}
        <section className="py-16 px-4 bg-muted">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <Image
                  src="/premium-thumbnail.png"
                  alt="Premium features for creative professionals showing advanced clipboard synchronization across design tools"
                  width={500}
                  height={500}
                  className="rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Currently in Beta – Premium Upgrade Available
                </h3>
                <p className="text-muted-foreground mb-6">Free during beta</p>
                <p className="text-foreground mb-6">
                  You're using the beta version of Clipbo.red. Want to unlock
                  premium features? Just log in and click "Upgrade to Premium" —
                  no payment required for now.
                </p>
                <p className="text-foreground mb-8">
                  Premium lets your data sync in real-time across all your
                  devices — phone and desktop — with a single login. A
                  subscription will be required after the official launch, and
                  we'll let you know the pricing in advance.
                </p>
                <Button size="lg" className="min-h-12" asChild>
                  <Link href="https://clipbo.red">Upgrade now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Section with Instagram Feed */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">
              Follow our Creative Journey
            </h3>

            {/* Instagram Feed */}
            <div className="mb-8">
              <InstagramFeed />
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              <Link
                href="https://discord.com/invite/nRzwh5vQTf"
                aria-label="Discord"
                className="p-2 hover:bg-muted rounded-lg transition-colors min-h-12 min-w-12 flex items-center justify-center"
              >
                <svg
                  className="h-7 stroke-current"
                  viewBox="0 0 192 192"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="12"
                    d="m68 138-8 16c-10.19-4.246-20.742-8.492-31.96-15.8-3.912-2.549-6.284-6.88-6.378-11.548-.488-23.964 5.134-48.056 19.369-73.528 1.863-3.334 4.967-5.778 8.567-7.056C58.186 43.02 64.016 40.664 74 39l6 11s6-2 16-2 16 2 16 2l6-11c9.984 1.664 15.814 4.02 24.402 7.068 3.6 1.278 6.704 3.722 8.567 7.056 14.235 25.472 19.857 49.564 19.37 73.528-.095 4.668-2.467 8.999-6.379 11.548-11.218 7.308-21.769 11.554-31.96 15.8l-8-16m-68-8s20 10 40 10 40-10 40-10"
                  />
                  <ellipse
                    cx="71"
                    cy="101"
                    className="fill-current"
                    rx="13"
                    ry="15"
                  />
                  <ellipse
                    cx="121"
                    cy="101"
                    className="fill-current"
                    rx="13"
                    ry="15"
                  />
                </svg>
              </Link>

              <Link
                href="https://api.whatsapp.com/send?phone=628978600340&text=Hello%20PRAYOGA.io%20team%2C%20I%27m%20interested%20in%20the%20Clipbored%20project%20and%20would%20like%20to%20discuss%20investment%20opportunities.%20Here%20are%20my%20details%3AName%3A%20Company%3A%20Email%3A%20Investment%20Interest%3A%20Looking%20forward%20to%20your%20response!"
                aria-label="Whatsapp"
                className="p-2 hover:bg-muted rounded-lg transition-colors min-h-12 min-w-12 flex items-center justify-center"
              >
                <svg
                  className="h-6"
                  viewBox="0 0 192 192"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="M96 16c-44.183 0-80 35.817-80 80 0 13.12 3.163 25.517 8.771 36.455l-8.608 36.155a6.002 6.002 0 0 0 7.227 7.227l36.155-8.608C70.483 172.837 82.88 176 96 176c44.183 0 80-35.817 80-80s-35.817-80-80-80ZM28 96c0-37.555 30.445-68 68-68s68 30.445 68 68-30.445 68-68 68c-11.884 0-23.04-3.043-32.747-8.389a6.003 6.003 0 0 0-4.284-.581l-28.874 6.875 6.875-28.874a6.001 6.001 0 0 0-.581-4.284C31.043 119.039 28 107.884 28 96Zm46.023 21.977c11.975 11.974 27.942 20.007 45.753 21.919 11.776 1.263 20.224-8.439 20.224-18.517v-6.996a18.956 18.956 0 0 0-13.509-18.157l-.557-.167-.57-.112-8.022-1.58a18.958 18.958 0 0 0-15.25 2.568 42.144 42.144 0 0 1-7.027-7.027 18.958 18.958 0 0 0 2.569-15.252l-1.582-8.021-.112-.57-.167-.557A18.955 18.955 0 0 0 77.618 52H70.62c-10.077 0-19.78 8.446-18.517 20.223 1.912 17.81 9.944 33.779 21.92 45.754Zm33.652-10.179a6.955 6.955 0 0 1 6.916-1.743l8.453 1.665a6.957 6.957 0 0 1 4.956 6.663v6.996c0 3.841-3.124 6.995-6.943 6.585a63.903 63.903 0 0 1-26.887-9.232 64.594 64.594 0 0 1-11.661-9.241 64.592 64.592 0 0 1-9.241-11.661 63.917 63.917 0 0 1-9.232-26.888C63.626 67.123 66.78 64 70.62 64h6.997a6.955 6.955 0 0 1 6.66 4.957l1.667 8.451a6.956 6.956 0 0 1-1.743 6.917l-1.12 1.12a5.935 5.935 0 0 0-1.545 2.669c-.372 1.403-.204 2.921.603 4.223a54.119 54.119 0 0 0 7.745 9.777 54.102 54.102 0 0 0 9.778 7.746c1.302.806 2.819.975 4.223.603a5.94 5.94 0 0 0 2.669-1.545l1.12-1.12Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              <Link
                href="https://www.instagram.com/prayoga.io/"
                aria-label="Instagram"
                className="p-2 hover:bg-muted rounded-lg transition-colors min-h-12 min-w-12 flex items-center justify-center"
              >
                <svg
                  className="h-6 stroke-current"
                  viewBox="0 0 192 192"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    strokeWidth="12"
                    d="M96 162c-14.152 0-24.336-.007-32.276-.777-7.849-.761-12.87-2.223-16.877-4.741a36 36 0 0 1-11.33-11.329c-2.517-4.007-3.98-9.028-4.74-16.877C30.007 120.336 30 110.152 30 96c0-14.152.007-24.336.777-32.276.76-7.849 2.223-12.87 4.74-16.877a36 36 0 0 1 11.33-11.33c4.007-2.517 9.028-3.98 16.877-4.74C71.663 30.007 81.847 30 96 30c14.152 0 24.336.007 32.276.777 7.849.76 12.87 2.223 16.877 4.74a36 36 0 0 1 11.329 11.33c2.518 4.007 3.98 9.028 4.741 16.877.77 7.94.777 18.124.777 32.276 0 14.152-.007 24.336-.777 32.276-.761 7.849-2.223 12.87-4.741 16.877a36 36 0 0 1-11.329 11.329c-4.007 2.518-9.028 3.98-16.877 4.741-7.94.77-18.124.777-32.276.777Z"
                  />
                  <circle cx="96" cy="96" r="30" strokeWidth="12" />
                  <circle cx="135" cy="57" r="9" className="fill-current" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} />
      </div>
    </>
  );
}
