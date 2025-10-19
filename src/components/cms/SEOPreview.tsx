"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SEOPreviewProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export default function SEOPreview({
  title,
  description,
  image,
  url,
}: SEOPreviewProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dokimas-cosmetics.com";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const displayUrl = fullUrl.replace(/^https?:\/\//, "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google">
          <TabsList className="w-full">
            <TabsTrigger value="google" className="flex-1">Google</TabsTrigger>
            <TabsTrigger value="twitter" className="flex-1">Twitter</TabsTrigger>
            <TabsTrigger value="facebook" className="flex-1">Facebook</TabsTrigger>
          </TabsList>

          {/* Google Preview */}
          <TabsContent value="google" className="space-y-2">
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-blue-600 mb-1">{displayUrl}</div>
              <h3 className="text-xl text-blue-800 hover:underline cursor-pointer mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            </div>
          </TabsContent>

          {/* Twitter Card Preview */}
          <TabsContent value="twitter" className="space-y-2">
            <div className="border rounded-lg overflow-hidden bg-white max-w-md">
              {image && (
                <img src={image} alt="Preview" className="w-full h-48 object-cover" />
              )}
              <div className="p-3">
                <div className="text-xs text-gray-500 mb-1">{displayUrl}</div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
              </div>
            </div>
          </TabsContent>

          {/* Facebook Card Preview */}
          <TabsContent value="facebook" className="space-y-2">
            <div className="border rounded-lg overflow-hidden bg-white max-w-md">
              {image && (
                <img src={image} alt="Preview" className="w-full h-64 object-cover" />
              )}
              <div className="p-3 bg-gray-50">
                <div className="text-xs text-gray-500 uppercase mb-1">{displayUrl}</div>
                <h3 className="font-semibold mb-1 line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{description}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


