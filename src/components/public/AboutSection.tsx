import { ISection } from "@/models/CMSPage";

interface AboutSectionProps {
  section: ISection;
}

export default function AboutSection({ section }: AboutSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          {section.image && (
            <div className="order-2 md:order-1">
              <img
                src={section.image}
                alt={section.title || "About"}
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div className="order-1 md:order-2">
            {section.title && (
              <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
            )}
            {section.subtitle && (
              <p className="text-xl text-purple-600 mb-6">{section.subtitle}</p>
            )}
            {section.content && (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


