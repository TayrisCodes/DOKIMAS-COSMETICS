import { Metadata } from "next";

/**
 * Generate Next.js Metadata object for pages
 */
export function generateMetadata(
  title: string,
  description: string,
  image?: string,
  url?: string
): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/images/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Dokimas Cosmetics",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate JSON-LD structured data for blog articles
 */
export function generateArticleJsonLd(article: {
  title: string;
  description: string;
  image?: string;
  publishedAt: Date;
  author?: { name: string };
  url: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image || `${siteUrl}/images/og-default.jpg`,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.publishedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author?.name || "Dokimas Cosmetics",
    },
    publisher: {
      "@type": "Organization",
      name: "Dokimas Cosmetics",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}${article.url}`,
    },
  };
}

/**
 * Generate JSON-LD structured data for products
 */
export function generateProductJsonLd(product: {
  name: string;
  description: string;
  image?: string;
  price: number;
  sku: string;
  url: string;
  averageRating?: number;
  reviewCount?: number;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image || `${siteUrl}/images/product-default.jpg`,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}${product.url}`,
      priceCurrency: "ETB",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  if (product.averageRating && product.reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating.toFixed(1),
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}


