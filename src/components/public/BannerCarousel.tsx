"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  _id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoplay?: boolean;
  interval?: number;
}

export default function BannerCarousel({
  banners,
  autoplay = true,
  interval = 5000,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoplay || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, autoplay, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-200">
      {/* Banner Image/Content */}
      {currentBanner.link ? (
        <Link href={currentBanner.link} className="block w-full h-full">
          <BannerContent banner={currentBanner} />
        </Link>
      ) : (
        <BannerContent banner={currentBanner} />
      )}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerContent({ banner }: { banner: Banner }) {
  return (
    <div
      className="relative w-full h-full bg-cover bg-center"
      style={{
        backgroundImage: banner.image ? `url(${banner.image})` : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
        {banner.title && (
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            {banner.title}
          </h2>
        )}
        {banner.subtitle && (
          <p className="text-xl md:text-2xl text-center">{banner.subtitle}</p>
        )}
      </div>
    </div>
  );
}


