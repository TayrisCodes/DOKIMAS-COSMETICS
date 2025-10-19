import { ISection } from "@/models/CMSPage";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FeaturedProductsSectionProps {
  section: ISection & { products?: any[] };
}

export default function FeaturedProductsSection({
  section,
}: FeaturedProductsSectionProps) {
  const products = section.products || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          {section.title && (
            <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-xl text-gray-600">{section.subtitle}</p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product._id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  {product.images?.[0] && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">
                        {product.price} ETB
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-sm text-green-600">In Stock</span>
                      ) : (
                        <span className="text-sm text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products available</p>
        )}

        {/* View All CTA */}
        {section.ctaText && section.ctaUrl && (
          <div className="text-center mt-12">
            <Link href={section.ctaUrl}>
              <Button size="lg" variant="outline">
                {section.ctaText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


