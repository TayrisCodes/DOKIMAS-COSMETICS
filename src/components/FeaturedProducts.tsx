"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart, Eye, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeaturedProductsProps {
  products?: any[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  // Mock data for demonstration if no products are provided
  const mockProducts = [
    {
      _id: "1",
      name: "Ethiopian Rose Body Oil",
      slug: "ethiopian-rose-body-oil",
      category: "Body Oils",
      description: "Luxurious body oil infused with authentic Ethiopian rose extract",
      price: 24.99,
      compareAtPrice: 29.99,
      images: ["/images/rose-oil.jpg"],
      averageRating: 4.8,
      reviewCount: 124,
      isFeatured: true,
      stock: 15
    },
    {
      _id: "2", 
      name: "Natural Aftershave Balm",
      slug: "natural-aftershave-balm",
      category: "Aftershave",
      description: "Soothing aftershave balm with aloe vera and chamomile",
      price: 18.99,
      images: ["/images/aftershave.jpg"],
      averageRating: 4.6,
      reviewCount: 89,
      isFeatured: true,
      stock: 22
    },
    {
      _id: "3",
      name: "Organic Face Cleanser",
      slug: "organic-face-cleanser", 
      category: "Cleansers",
      description: "Gentle organic cleanser for all skin types",
      price: 16.99,
      compareAtPrice: 19.99,
      images: ["/images/cleanser.jpg"],
      averageRating: 4.9,
      reviewCount: 156,
      isFeatured: true,
      stock: 8
    },
    {
      _id: "4",
      name: "Herbal Deodorant Stick",
      slug: "herbal-deodorant-stick",
      category: "Deodorants", 
      description: "Natural deodorant with sage and lavender",
      price: 12.99,
      images: ["/images/deodorant.jpg"],
      averageRating: 4.5,
      reviewCount: 67,
      isFeatured: true,
      stock: 30
    }
  ];

  const displayProducts = products.length > 0 ? products.slice(0, 4) : mockProducts;

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-purple-100 text-purple-700">
            <Star className="mr-1 h-3 w-3" />
            Featured Products
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Best Sellers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our most loved products, carefully selected for their quality, 
            effectiveness, and customer satisfaction.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden bg-white">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Package className="h-16 w-16 text-purple-400" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Package className="h-16 w-16 text-purple-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-purple-600 text-white">
                        Featured
                      </Badge>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <Badge variant="destructive">
                          Sale
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="secondary" className="rounded-full p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="rounded-full p-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs mb-2">
                        {product.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({product.reviewCount || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-purple-600">
                          ${product.price}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.stock > 0 ? (
                          <span className="text-green-600">In Stock</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Link href={`/product/${product.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={product.stock === 0}
                        className="px-3"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-6">
            <Link href="/shop">
              View All Products
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}






