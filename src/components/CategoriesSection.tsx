"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Droplets, 
  Wind, 
  Scissors, 
  Heart, 
  Sun,
  Moon,
  Star,
  Zap,
  Shield
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CategoriesSection() {
  const categories = [
    {
      id: "aftershave",
      name: "Aftershave",
      description: "Soothe and refresh your skin after shaving",
      icon: Wind,
      color: "from-blue-400 to-cyan-400",
      bgColor: "from-blue-50 to-cyan-50",
      textColor: "text-blue-700",
      count: "12 Products"
    },
    {
      id: "body-oils",
      name: "Body Oils",
      description: "Nourish and moisturize your skin naturally",
      icon: Droplets,
      color: "from-amber-400 to-orange-400",
      bgColor: "from-amber-50 to-orange-50",
      textColor: "text-amber-700",
      count: "8 Products"
    },
    {
      id: "deodorants",
      name: "Deodorants",
      description: "Natural protection that keeps you fresh",
      icon: Shield,
      color: "from-green-400 to-emerald-400",
      bgColor: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
      count: "6 Products"
    },
    {
      id: "cleansers",
      name: "Cleansers",
      description: "Gentle cleansing for all skin types",
      icon: Sparkles,
      color: "from-purple-400 to-pink-400",
      bgColor: "from-purple-50 to-pink-50",
      textColor: "text-purple-700",
      count: "15 Products"
    },
    {
      id: "moisturizers",
      name: "Moisturizers",
      description: "Hydrate and protect your skin daily",
      icon: Heart,
      color: "from-rose-400 to-pink-400",
      bgColor: "from-rose-50 to-pink-50",
      textColor: "text-rose-700",
      count: "10 Products"
    },
    {
      id: "serums",
      name: "Serums",
      description: "Concentrated treatments for targeted care",
      icon: Zap,
      color: "from-violet-400 to-purple-400",
      bgColor: "from-violet-50 to-purple-50",
      textColor: "text-violet-700",
      count: "7 Products"
    },
    {
      id: "masks",
      name: "Masks",
      description: "Deep treatment masks for glowing skin",
      icon: Moon,
      color: "from-indigo-400 to-blue-400",
      bgColor: "from-indigo-50 to-blue-50",
      textColor: "text-indigo-700",
      count: "5 Products"
    },
    {
      id: "sunscreen",
      name: "Sunscreen",
      description: "Protect your skin from harmful UV rays",
      icon: Sun,
      color: "from-yellow-400 to-orange-400",
      bgColor: "from-yellow-50 to-orange-50",
      textColor: "text-yellow-700",
      count: "4 Products"
    }
  ];

  return (
    <section className="py-20 bg-white">
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
            Product Categories
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Explore Our Beauty Collection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated range of natural cosmetics, each category designed 
            to enhance your beauty routine with authentic Ethiopian ingredients.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden cursor-pointer">
                <CardContent className="p-0">
                  {/* Category Image/Icon */}
                  <div className={`h-32 bg-gradient-to-br ${category.bgColor} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <category.icon className="h-8 w-8 text-white" />
                      </motion.div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {category.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <Button 
                      asChild 
                      variant="outline" 
                      className={`w-full border-2 ${category.textColor} hover:bg-gradient-to-r ${category.bgColor} transition-all duration-300`}
                    >
                      <Link href={`/shop?category=${category.name}`}>
                        Shop {category.name}
                      </Link>
                    </Button>
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






