"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/cms/ImageUpload";
import SEOPreview from "@/components/cms/SEOPreview";
import { toast } from "sonner";
import { Save, Plus, X } from "lucide-react";

export default function SEOManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: [] as string[],
    socialPreviewImage: "",
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const response = await fetch("/api/seo");
      const data = await response.json();
      if (response.ok && data.data) {
        setFormData({
          metaTitle: data.data.metaTitle || "",
          metaDescription: data.data.metaDescription || "",
          keywords: data.data.keywords || [],
          socialPreviewImage: data.data.socialPreviewImage || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch SEO settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch("/api/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save SEO settings");
      }

      toast.success("SEO settings updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.keywords.includes(keywordInput.trim())
    ) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading SEO settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEO Manager</h1>
        <p className="text-gray-600">
          Configure global SEO settings for your site
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Meta Title</Label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="Dokimas Cosmetics - Natural Beauty from Ethiopia"
                  maxLength={60}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label>Default Meta Description</Label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  placeholder="Handmade natural cosmetics using traditional Ethiopian ingredients. Premium quality beauty products."
                  rows={4}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Add keyword..."
                  />
                  <Button type="button" onClick={addKeyword} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeKeyword(keyword)}
                    >
                      {keyword} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Add relevant keywords for search engines
                </p>
              </div>

              <div>
                <Label>Social Preview Image</Label>
                <ImageUpload
                  value={formData.socialPreviewImage}
                  onChange={(url) =>
                    setFormData({ ...formData, socialPreviewImage: url })
                  }
                  onRemove={() =>
                    setFormData({ ...formData, socialPreviewImage: "" })
                  }
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended size: 1200x630px (Used for social media shares)
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save SEO Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* SEO Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Keep titles under 60 characters to avoid truncation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Meta descriptions should be 150-160 characters
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Use descriptive, keyword-rich titles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Include your brand name in the title</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Write compelling descriptions that encourage clicks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    Choose 5-10 relevant keywords for your business
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <SEOPreview
            title={formData.metaTitle || "Your Site Title"}
            description={
              formData.metaDescription || "Your site description goes here..."
            }
            image={formData.socialPreviewImage}
            url="/"
          />

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sitemap</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Robots.txt</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Configured
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Enabled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mobile Friendly</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Yes
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Page Speed</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  Good
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indexed Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Homepage</span>
                  <Badge variant="outline">Indexed</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Blog Posts</span>
                  <Badge variant="outline">5 Indexed</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Product Pages</span>
                  <Badge variant="outline">12 Indexed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


