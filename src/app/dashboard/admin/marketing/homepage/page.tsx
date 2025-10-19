"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SectionCard from "@/components/cms/SectionCard";
import TipTapEditor from "@/components/cms/TipTapEditor";
import ImageUpload from "@/components/cms/ImageUpload";
import ProductPicker from "@/components/cms/ProductPicker";
import { toast } from "sonner";
import { Save, Plus } from "lucide-react";

function SortableSection({ section, onEdit, onToggle, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionCard
        section={section}
        onEdit={onEdit}
        onToggle={onToggle}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function HomepageEditor() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const response = await fetch("/api/cms/pages/home");
      const data = await response.json();
      if (response.ok) {
        setPage(data.data);
      } else {
        toast.error("Failed to load homepage");
      }
    } catch (error) {
      toast.error("Failed to load homepage");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = page.sectionsOrder.indexOf(active.id);
    const newIndex = page.sectionsOrder.indexOf(over.id);

    const newOrder = [...page.sectionsOrder];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);

    // Optimistic update
    setPage({ ...page, sectionsOrder: newOrder });

    // Save to server
    try {
      const response = await fetch("/api/cms/pages/home/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionsOrder: newOrder }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder sections");
      }

      toast.success("Sections reordered");
    } catch (error) {
      toast.error("Failed to save order");
      fetchPage(); // Revert on error
    }
  };

  const handleToggleSection = async (key: string) => {
    const section = page.sections.find((s: any) => s.key === key);
    if (!section) return;

    const updatedSections = page.sections.map((s: any) =>
      s.key === key ? { ...s, active: !s.active } : s
    );

    setPage({ ...page, sections: updatedSections });

    try {
      await savePage({ sections: updatedSections });
      toast.success("Section updated");
    } catch (error) {
      toast.error("Failed to update section");
      fetchPage();
    }
  };

  const handleDeleteSection = async (key: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    const updatedSections = page.sections.filter((s: any) => s.key !== key);
    const updatedOrder = page.sectionsOrder.filter((k: string) => k !== key);

    setPage({ ...page, sections: updatedSections, sectionsOrder: updatedOrder });

    try {
      await savePage({ sections: updatedSections, sectionsOrder: updatedOrder });
      toast.success("Section deleted");
    } catch (error) {
      toast.error("Failed to delete section");
      fetchPage();
    }
  };

  const handleSaveSection = async (updatedSection: any) => {
    const updatedSections = page.sections.map((s: any) =>
      s.key === updatedSection.key ? updatedSection : s
    );

    try {
      await savePage({ sections: updatedSections });
      setPage({ ...page, sections: updatedSections });
      setEditingSection(null);
      toast.success("Section saved");
    } catch (error) {
      toast.error("Failed to save section");
    }
  };

  const savePage = async (updates: any) => {
    const response = await fetch("/api/cms/pages/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to save");
    }

    return response.json();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading homepage...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">Failed to load homepage</div>
      </div>
    );
  }

  const orderedSections = page.sectionsOrder
    ?.map((key: string) => page.sections.find((s: any) => s.key === key))
    .filter(Boolean) || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Homepage Editor</h1>
          <p className="text-gray-600">
            Drag sections to reorder, click edit to modify content
          </p>
        </div>
        <Button onClick={() => window.open("/", "_blank")}>
          Preview Site
        </Button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={page.sectionsOrder || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {orderedSections.map((section: any) => (
              <SortableSection
                key={section.key}
                section={section}
                onEdit={() => setEditingSection(section)}
                onToggle={() => handleToggleSection(section.key)}
                onDelete={() => handleDeleteSection(section.key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Section Dialog */}
      {editingSection && (
        <EditSectionDialog
          section={editingSection}
          onSave={handleSaveSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}

function EditSectionDialog({ section, onSave, onClose }: any) {
  const [formData, setFormData] = useState(section);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Section: {section.title || section.key}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>

          <div>
            <Label>Content</Label>
            <TipTapEditor
              content={formData.content || ""}
              onChange={(html) => setFormData({ ...formData, content: html })}
            />
          </div>

          <div>
            <Label>Image</Label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onRemove={() => setFormData({ ...formData, image: "" })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CTA Text</Label>
              <Input
                value={formData.ctaText || ""}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>
            <div>
              <Label>CTA URL</Label>
              <Input
                value={formData.ctaUrl || ""}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
              />
            </div>
          </div>

          {section.key === "featured_products" && (
            <div>
              <Label>Featured Products</Label>
              <ProductPicker
                selectedIds={formData.productsQuery?.ids || []}
                onChange={(ids) =>
                  setFormData({
                    ...formData,
                    productsQuery: { type: "byIds", ids },
                  })
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



