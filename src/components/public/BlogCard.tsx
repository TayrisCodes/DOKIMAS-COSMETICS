import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface BlogCardProps {
  blog: {
    slug: string;
    title: string;
    excerpt?: string;
    image?: string;
    categories?: string[];
    publishedAt?: Date;
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
        {blog.image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
              {blog.excerpt}
            </p>
          )}

          {/* Date */}
          {blog.publishedAt && (
            <div className="flex items-center text-sm text-gray-500 mt-auto">
              <Calendar className="w-4 h-4 mr-2" />
              <time dateTime={blog.publishedAt.toISOString()}>
                {format(new Date(blog.publishedAt), "MMMM d, yyyy")}
              </time>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}


