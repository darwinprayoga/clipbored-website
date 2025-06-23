import Image from "next/image";

interface Company {
  name: string;
  logo: string;
  width: number;
  height: number;
}

const companies: Company[] = [
  {
    name: "Netflix",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/netflix-logo.svg",
    width: 75,
    height: 20,
  },
  {
    name: "Datadog",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/datadog-logo.svg",
    width: 127,
    height: 32,
  },
  {
    name: "Meta",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Meta-logo.svg",
    width: 101,
    height: 20,
  },
  {
    name: "Microsoft",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Microsoft_logo.svg",
    width: 94,
    height: 20,
  },
  {
    name: "Stripe",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Stripe_logo.svg",
    width: 47,
    height: 20,
  },
  {
    name: "Supabase",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Supabase_logo.svg",
    width: 103,
    height: 20,
  },
  {
    name: "Intel",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Intel_logo.svg",
    width: 31,
    height: 20,
  },
  {
    name: "Netlify",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Netlify_logo.svg",
    width: 49,
    height: 20,
  },
  {
    name: "Wix",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Wix_logo.svg",
    width: 51,
    height: 20,
  },
  {
    name: "Odoo",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Odoo_logo.svg",
    width: 64,
    height: 20,
  },
  {
    name: "Tecton",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/tecton-logo.svg",
    width: 111,
    height: 20,
  },
  {
    name: "Capco",
    logo: "https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/Capco-logo.svg",
    width: 59,
    height: 20,
  },
];

export default function TrustedByMarquee() {
  return (
    <section className="py-16 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Trusted by the largest companies in the world
          </h2>
          <p className="text-muted-foreground">
            Join thousands of teams who rely on our productivity tools
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden mb-8">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted to-transparent z-10 pointer-events-none" />

          {/* Marquee content */}
          <div className="flex animate-marquee-logos whitespace-nowrap min-w-max">
            {[...Array(2)].map((_, repeatIndex) => (
              <div
                key={repeatIndex}
                className="flex items-center gap-12 pr-12"
                aria-hidden={repeatIndex === 1}
              >
                {companies.map((company, index) => (
                  <div
                    key={`${repeatIndex}-${index}`}
                    className={`
              flex items-center justify-center min-w-fit px-4 py-2
              ${index === 0 ? "ml-4" : ""}
            `}
                  >
                    <Image
                      src={company.logo || "/placeholder.svg"}
                      alt={`${company.name} logo`}
                      width={company.width}
                      height={company.height}
                      className="opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                      style={{
                        width: company.width,
                        height: company.height,
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
