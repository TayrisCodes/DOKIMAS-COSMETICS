import { generateMetadata as generateSEOMetadata, generateArticleJsonLd } from "@/lib/cms/seoUtils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import BlogCard from "@/components/public/BlogCard";

interface BlogPageProps {
  params: { slug: string };
}

// Fetch blog post
async function getBlog(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

// Fetch related blogs
async function getRelatedBlogs(categories: string[], currentSlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const category = categories[0];
    const response = await fetch(
      `${baseUrl}/api/blogs?category=${category}&perPage=3`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data.posts.filter((post: any) => post.slug !== currentSlug);
  } catch (error) {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return generateSEOMetadata(
      "Blog Post Not Found",
      "The blog post you're looking for doesn't exist.",
      undefined,
      `/blog/${params.slug}`
    );
  }

  return generateSEOMetadata(
    blog.metaTitle || blog.title,
    blog.metaDescription || blog.excerpt || "",
    blog.image,
    `/blog/${blog.slug}`
  );
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = blog.categories
    ? await getRelatedBlogs(blog.categories, blog.slug)
    : [];

  // Generate JSON-LD structured data
  const jsonLd = generateArticleJsonLd({
    title: blog.title,
    description: blog.excerpt || "",
    image: blog.image,
    publishedAt: new Date(blog.publishedAt || blog.createdAt),
    author: blog.author,
    url: `/blog/${blog.slug}`,
  });

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-white">
        {/* Hero Image */}
        {blog.image && (
          <div className="w-full h-[400px] bg-gray-200">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.categories.map((category: string) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
              {blog.author && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{blog.author.name || "Dokimas Team"}</span>
                </div>
              )}
              {blog.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <time dateTime={blog.publishedAt}>
                    {format(new Date(blog.publishedAt), "MMMM d, yyyy")}
                  </time>
                </div>
              )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Content */}
            {blog.content && (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="max-w-6xl mx-auto mt-16">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog: any) => (
                  <BlogCard key={relatedBlog._id} blog={relatedBlog} />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}


