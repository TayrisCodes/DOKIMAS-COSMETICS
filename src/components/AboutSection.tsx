"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Users, Award, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutSection() {
  const features = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "Made with pure, organic ingredients sourced from Ethiopia's rich biodiversity."
    },
    {
      icon: Heart,
      title: "Skin-Friendly",
      description: "Gentle formulas designed for all skin types, including sensitive skin."
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Supporting local communities and traditional knowledge preservation."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Rigorous testing and quality control ensure the highest standards."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700">
              <Globe className="mr-1 h-3 w-3" />
              Our Story
            </Badge>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Celebrating Ethiopian Beauty Heritage
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Dokimas Cosmetics, we believe that true beauty comes from embracing your natural self. 
              Our products are crafted using traditional Ethiopian ingredients that have been cherished 
              for generations, combined with modern cosmetic science.
            </p>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From the highlands of Ethiopia to your daily beauty routine, we bring you authentic, 
              natural cosmetics that celebrate your unique beauty while supporting sustainable practices 
              and local communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/about">
                  Learn More About Us
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Link href="/shop">
                  Shop Our Products
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image Card */}
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative">
                  {/* Decorative Elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                      >
                        <Sparkles className="h-16 w-16 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Ethiopian Heritage</h3>
                      <p className="text-gray-600">Natural Beauty, Traditional Wisdom</p>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="absolute top-4 left-4"
                  >
                    <Badge className="bg-white/90 text-purple-700 shadow-md">
                      <Leaf className="mr-1 h-3 w-3" />
                      Organic
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="absolute top-4 right-4"
                  >
                    <Badge className="bg-white/90 text-green-700 shadow-md">
                      <Heart className="mr-1 h-3 w-3" />
                      Cruelty-Free
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="absolute bottom-4 left-4"
                  >
                    <Badge className="bg-white/90 text-blue-700 shadow-md">
                      <Globe className="mr-1 h-3 w-3" />
                      Sustainable
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Background Decoration */}
            <div className="absolute -z-10 inset-0">
              <div className="absolute top-1/4 -left-8 w-24 h-24 bg-purple-200 rounded-full opacity-30 blur-xl" />
              <div className="absolute bottom-1/4 -right-8 w-32 h-32 bg-pink-200 rounded-full opacity-30 blur-xl" />
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}






