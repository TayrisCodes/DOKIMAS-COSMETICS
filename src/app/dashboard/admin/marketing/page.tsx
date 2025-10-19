"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Image as ImageIcon, Mail, Settings, Globe } from "lucide-react";
import { toast } from "sonner";

export default function MarketingDashboard() {
  const [stats, setStats] = useState({
    pages: 0,
    blogs: 0,
    banners: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pagesRes, blogsRes, bannersRes, newsletterRes] = await Promise.all([
        fetch("/api/cms/pages"),
        fetch("/api/blogs"),
        fetch("/api/banners?includeInactive=true"),
        fetch("/api/newsletter"),
      ]);

      const pages = await pagesRes.json();
      const blogs = await blogsRes.json();
      const banners = await bannersRes.json();
      const newsletter = await newsletterRes.json();

      setStats({
        pages: pages.data?.length || 0,
        blogs: blogs.data?.meta?.total || 0,
        banners: banners.data?.length || 0,
        subscribers: newsletter.data?.count || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: "Homepage Editor",
      description: "Edit and reorder homepage sections",
      icon: Globe,
      href: "/dashboard/admin/marketing/homepage",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Blog Management",
      description: "Create and manage blog posts",
      icon: FileText,
      href: "/dashboard/admin/blogs",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Banners",
      description: "Manage promotional banners",
      icon: ImageIcon,
      href: "/dashboard/admin/banners",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Newsletter",
      description: "Send campaigns to subscribers",
      icon: Mail,
      href: "/dashboard/admin/newsletter",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "SEO Settings",
      description: "Configure global SEO",
      icon: Settings,
      href: "/dashboard/admin/seo",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketing & Content</h1>
        <p className="text-gray-600">
          Manage your website content, blog posts, and marketing campaigns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              CMS Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.pages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.blogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Banners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.banners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.subscribers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${link.color}`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}


