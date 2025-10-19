"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type,
  ShoppingBag,
  Quote,
  Layout,
  Mail,
} from "lucide-react";
import { ISection } from "@/models/CMSPage";

interface SectionCardProps {
  section: ISection;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

const sectionIcons: Record<string, any> = {
  hero: ImageIcon,
  about: Type,
  shop_cta: ShoppingBag,
  featured_products: ShoppingBag,
  blog_highlights: Type,
  testimonials: Quote,
  promotions: Layout,
  newsletter_signup: Mail,
  footer: Layout,
};

export default function SectionCard({
  section,
  onEdit,
  onToggle,
  onDelete,
  dragHandleProps,
}: SectionCardProps) {
  const Icon = sectionIcons[section.key] || Layout;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Icon */}
        <div className="bg-purple-100 p-2 rounded">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">
              {section.title || section.key}
            </h3>
            <Badge variant={section.active ? "default" : "secondary"}>
              {section.active ? "Active" : "Hidden"}
            </Badge>
          </div>
          {section.subtitle && (
            <p className="text-sm text-gray-600 truncate">{section.subtitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Key: {section.key}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            title={section.active ? "Hide section" : "Show section"}
          >
            {section.active ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title="Edit section"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            title="Delete section"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}


