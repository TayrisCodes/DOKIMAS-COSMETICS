"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/cms/ImageUpload";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default function BannersManagement() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners?includeInactive=true");
      const data = await response.json();
      if (response.ok) {
        setBanners(data.data || []);
      } else {
        toast.error("Failed to load banners");
      }
    } catch (error) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success("Banner updated");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to update banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Banner deleted");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Banner Management</h1>
          <p className="text-gray-600">
            Manage promotional banners for your site
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Banner
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No banners found. Create your first banner!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner._id}>
              <CardContent className="p-0">
                {/* Banner Image */}
                <div className="relative h-48 bg-gray-200">
                  {banner.image && (
                    <img
                      src={banner.image}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={banner.active ? "default" : "secondary"}>
                      {banner.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{banner.position}</Badge>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">
                    {banner.title || "Untitled Banner"}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link && (
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      Link: {banner.link}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingBanner(banner)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(banner._id, banner.active)}
                    >
                      {banner.active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(banner._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {(isCreating || editingBanner) && (
        <BannerDialog
          banner={editingBanner}
          onClose={() => {
            setIsCreating(false);
            setEditingBanner(null);
          }}
          onSuccess={() => {
            setIsCreating(false);
            setEditingBanner(null);
            fetchBanners();
          }}
        />
      )}
    </div>
  );
}

function BannerDialog({ banner, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    image: banner?.image || "",
    link: banner?.link || "",
    position: banner?.position || "hero",
    active: banner?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Image is required");
      return;
    }

    setSaving(true);

    try {
      const url = banner ? `/api/banners/${banner._id}` : "/api/banners";
      const method = banner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save banner");
      }

      toast.success(banner ? "Banner updated" : "Banner created");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit Banner" : "Create Banner"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Banner title..."
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Banner subtitle..."
            />
          </div>

          <div>
            <Label>Image *</Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: "" })}
            />
          </div>

          <div>
            <Label>Link URL</Label>
            <Input
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="/shop or https://..."
            />
          </div>

          <div>
            <Label>Position</Label>
            <Select
              value={formData.position}
              onValueChange={(value) =>
                setFormData({ ...formData, position: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="mid">Mid-Page</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : banner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


