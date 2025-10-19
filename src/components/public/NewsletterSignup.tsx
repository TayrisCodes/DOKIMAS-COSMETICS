"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ISection } from "@/models/CMSPage";

interface NewsletterSignupProps {
  section: ISection;
}

export default function NewsletterSignup({ section }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      toast.success(data.message || "Successfully subscribed!");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-white">
          {section.title && (
            <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-xl mb-6">{section.subtitle}</p>
          )}
          {section.content && (
            <div
              className="mb-8"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}

          <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-gray-900"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          <p className="text-sm mt-4 opacity-90">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}


