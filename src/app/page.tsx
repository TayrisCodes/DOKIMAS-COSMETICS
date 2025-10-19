import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import FeaturedProductsSection from "@/components/public/FeaturedProductsSection";
import NewsletterSignup from "@/components/public/NewsletterSignup";
import { generateMetadata as generateSEOMetadata } from "@/lib/cms/seoUtils";
import { Metadata } from "next";

// Fetch homepage data
async function getHomepage() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/cms/pages/home`, {
      cache: "no-store", // Always fetch fresh data for homepage
    });

    if (!response.ok) {
      throw new Error("Failed to fetch homepage");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching homepage:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomepage();

  if (!page) {
    return generateSEOMetadata(
      "Dokimas Cosmetics - Natural Beauty from Ethiopia",
      "Handmade natural cosmetics using traditional Ethiopian ingredients.",
      undefined,
      "/"
    );
  }

  return generateSEOMetadata(
    page.metaTitle || page.title || "Dokimas Cosmetics",
    page.metaDescription || "Natural beauty products from Ethiopia",
    page.sections?.[0]?.image,
    "/"
  );
}

export default async function Home() {
  const page = await getHomepage();

  if (!page || !page.sections) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Homepage content not available</p>
      </div>
    );
  }

  const sections = page.sections;

  return (
    <div className="min-h-screen">
      {sections.map((section: any) => {
        if (!section.active) return null;

        switch (section.key) {
          case "hero":
            return <HeroSection key={section._id} section={section} />;

          case "about":
            return <AboutSection key={section._id} section={section} />;

          case "featured_products":
            return <FeaturedProductsSection key={section._id} section={section} />;

          case "newsletter_signup":
            return <NewsletterSignup key={section._id} section={section} />;

          case "shop_cta":
          case "blog_highlights":
          case "testimonials":
          case "promotions":
          case "footer":
            // Generic section renderer
            return (
              <section key={section._id} className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  {section.title && (
                    <h2 className="text-4xl font-bold text-center mb-8">
                      {section.title}
                    </h2>
                  )}
                  {section.subtitle && (
                    <p className="text-xl text-center text-gray-600 mb-8">
                      {section.subtitle}
                    </p>
                  )}
                  {section.content && (
                    <div
                      className="prose prose-lg max-w-4xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  )}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
