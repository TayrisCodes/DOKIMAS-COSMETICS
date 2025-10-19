import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ISection } from "@/models/CMSPage";

interface HeroSectionProps {
  section: ISection;
}

export default function HeroSection({ section }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: section.image ? `url(${section.image})` : undefined,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        {section.title && (
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            {section.title}
          </h1>
        )}
        {section.subtitle && (
          <p className="text-xl md:text-2xl mb-8">{section.subtitle}</p>
        )}
        {section.content && (
          <div
            className="text-lg mb-8 max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
        {section.ctaText && section.ctaUrl && (
          <Link href={section.ctaUrl}>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              {section.ctaText}
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}


