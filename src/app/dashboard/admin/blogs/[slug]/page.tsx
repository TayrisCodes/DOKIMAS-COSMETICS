"use client";
import { use } from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import TipTapEditor from "@/components/cms/TipTapEditor";
import ImageUpload from "@/components/cms/ImageUpload";
import SEOPreview from "@/components/cms/SEOPreview";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { slugify } from "@/lib/slugify";

const CATEGORIES = [
  "product-education",
  "beauty-tips",
  "expert-advice",
  "routines",
  "brand-news",
];

export default function BlogEditor({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    categories: [] as string[],
    tags: [] as string[],
    isPublished: false,
    featureOnHomepage: false,
    metaTitle: "",
    metaDescription: "",
    publishedAt: "",
    notifySubscribers: false,
  });
  const [tagInput, setTagInput] = useState("");

  const isNew = resolvedParams.slug === "new";

  const resolvedParams = use(params);
  useEffect(() => {
    if (!isNew) {
      fetchBlog();
    } else {
      setLoading(false);
    }
  }, [resolvedParams.slug]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${resolvedParams.slug}`);
      const data = await response.json();

      if (response.ok) {
        const blog = data.data;
        setFormData({
          title: blog.title || "",
          content: blog.content || "",
          excerpt: blog.excerpt || "",
          image: blog.image || "",
          categories: blog.categories || [],
          tags: blog.tags || [],
          isPublished: blog.isPublished || false,
          featureOnHomepage: blog.featureOnHomepage || false,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          publishedAt: blog.publishedAt
            ? new Date(blog.publishedAt).toISOString().split("T")[0]
            : "",
          notifySubscribers: false,
        });
      } else {
        toast.error("Failed to load blog");
        router.push("/dashboard/admin/blogs");
      }
    } catch (error) {
      toast.error("Failed to load blog");
      router.push("/dashboard/admin/blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        isPublished: publish,
        tags: formData.tags.filter((t) => t.trim()),
      };

      const url = isNew ? "/api/blogs" : `/api/blogs/${resolvedParams.slug}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save blog");
      }

      toast.success(publish ? "Blog published" : "Blog saved as draft");

      if (isNew) {
        router.push("/dashboard/admin/blogs");
      } else {
        fetchBlog();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const generatedSlug = slugify(formData.title);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/admin/blogs")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Button>
        <h1 className="text-3xl font-bold">
          {isNew ? "Create New Blog Post" : "Edit Blog Post"}
        </h1>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter blog title..."
                    required
                  />
                  {formData.title && (
                    <p className="text-sm text-gray-500 mt-1">
                      Slug: {generatedSlug}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Brief description for previews..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <TipTapEditor
                    content={formData.content}
                    onChange={(html) =>
                      setFormData({ ...formData, content: html })
                    }
                  />
                </div>

                <div>
                  <Label>Featured Image</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) =>
                      setFormData({ ...formData, image: url })
                    }
                    onRemove={() => setFormData({ ...formData, image: "" })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">SEO Settings</h3>
                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    placeholder={formData.title || "SEO title..."}
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder={formData.excerpt || "SEO description..."}
                    rows={3}
                  />
                </div>
                <SEOPreview
                  title={formData.metaTitle || formData.title}
                  description={
                    formData.metaDescription || formData.excerpt
                  }
                  image={formData.image}
                  url={`/blog/${generatedSlug}`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Publish</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featureOnHomepage}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        featureOnHomepage: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="featured" className="text-sm">
                    Feature on homepage
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify"
                    checked={formData.notifySubscribers}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifySubscribers: checked as boolean,
                      })
                    }
                  />
                  <label htmlFor="notify" className="text-sm">
                    Notify subscribers
                  </label>
                </div>

                <div>
                  <Label>Publish Date</Label>
                  <Input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      setFormData({ ...formData, publishedAt: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="flex-1"
                    disabled={saving}
                  >
                    Publish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Categories</h3>
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label htmlFor={category} className="text-sm capitalize">
                      {category.replace("-", " ")}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}



