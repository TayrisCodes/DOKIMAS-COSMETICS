import BlogCard from "@/components/public/BlogCard";
import { generateMetadata as generateSEOMetadata } from "@/lib/cms/seoUtils";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchParams {
  page?: string;
  category?: string;
  search?: string;
}

// Generate metadata for SEO
export const metadata: Metadata = generateSEOMetadata(
  "Blog - Dokimas Cosmetics",
  "Discover beauty tips, product education, and expert skincare advice from Dokimas Cosmetics.",
  undefined,
  "/blog"
);

// Fetch blogs
async function getBlogs(page: number = 1, category?: string, search?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: "12",
    });

    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const response = await fetch(`${baseUrl}/api/blogs?${params}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blogs");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { posts: [], meta: { total: 0, page: 1, totalPages: 0 } };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const category = searchParams.category;
  const search = searchParams.search;

  const { posts, meta } = await getBlogs(page, category, search);

  const categories = [
    "product-education",
    "beauty-tips",
    "expert-advice",
    "routines",
    "brand-news",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Beauty Blog</h1>
          <p className="text-xl text-gray-600">
            Tips, tricks, and inspiration for natural beauty
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <Link href="/blog">
            <Button variant={!category ? "default" : "outline"} size="sm">
              All Posts
            </Button>
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/blog?category=${cat}`}>
              <Button variant={category === cat ? "default" : "outline"} size="sm">
                {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post: any) => (
              <BlogCard key={post._id} blog={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts found.</p>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {page > 1 && (
              <Link href={`/blog?page=${page - 1}${category ? `&category=${category}` : ""}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            <div className="flex items-center px-4">
              Page {page} of {meta.totalPages}
            </div>
            {page < meta.totalPages && (
              <Link href={`/blog?page=${page + 1}${category ? `&category=${category}` : ""}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


