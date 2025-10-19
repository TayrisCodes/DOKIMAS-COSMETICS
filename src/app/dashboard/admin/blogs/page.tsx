"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?perPage=100");
      const data = await response.json();
      if (response.ok) {
        setBlogs(data.data.posts || []);
      } else {
        toast.error("Failed to load blogs");
      }
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (slug: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureOnHomepage: !currentValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success("Blog updated");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to update blog");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Blog deleted");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "published" && blog.isPublished) ||
      (activeTab === "drafts" && !blog.isPublished) ||
      (activeTab === "featured" && blog.featureOnHomepage);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
          <p className="text-gray-600">
            Create and manage blog posts
          </p>
        </div>
        <Link href="/dashboard/admin/blogs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Blog Post
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search blog posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({blogs.length})</TabsTrigger>
          <TabsTrigger value="published">
            Published ({blogs.filter((b) => b.isPublished).length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({blogs.filter((b) => !b.isPublished).length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({blogs.filter((b) => b.featureOnHomepage).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No blog posts found
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBlogs.map((blog) => (
                <Card key={blog._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-32 h-24 object-cover rounded"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {blog.excerpt}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/admin/blogs/${blog.slug}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleToggleFeatured(blog.slug, blog.featureOnHomepage)
                              }
                            >
                              {blog.featureOnHomepage ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(blog.slug)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {/* Categories */}
                          {blog.categories?.length > 0 && (
                            <div className="flex gap-1">
                              {blog.categories.map((cat: string) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Status */}
                          <Badge variant={blog.isPublished ? "default" : "outline"}>
                            {blog.isPublished ? "Published" : "Draft"}
                          </Badge>

                          {/* Featured */}
                          {blog.featureOnHomepage && (
                            <Badge variant="default" className="bg-purple-600">
                              Featured
                            </Badge>
                          )}

                          {/* Date */}
                          {blog.publishedAt && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(blog.publishedAt), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}



