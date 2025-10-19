"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TipTapEditor from "@/components/cms/TipTapEditor";
import { toast } from "sonner";
import { Send, Users } from "lucide-react";

export default function NewsletterManagement() {
  const [stats, setStats] = useState({ count: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    html: "",
    segment: "subscribers",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/newsletter");
      const data = await response.json();
      if (response.ok) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!formData.html.trim()) {
      toast.error("Email content is required");
      return;
    }

    if (!confirm(`Send newsletter to ${formData.segment}?`)) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send newsletter");
      }

      toast.success(data.message || "Newsletter queued for sending");
      setFormData({ subject: "", html: "", segment: "subscribers" });
    } catch (error: any) {
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newsletter Management</h1>
        <p className="text-gray-600">
          Send email campaigns to your subscribers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div className="text-3xl font-bold">
                {loading ? "..." : stats.count}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{Math.floor(stats.count * 0.15)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Campaigns Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Compose Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle>Compose Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Subject Line *</Label>
            <Input
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <Label>Email Content *</Label>
            <TipTapEditor
              content={formData.html}
              onChange={(html) => setFormData({ ...formData, html })}
              placeholder="Compose your newsletter..."
            />
          </div>

          <div>
            <Label>Send To</Label>
            <Select
              value={formData.segment}
              onValueChange={(value) =>
                setFormData({ ...formData, segment: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subscribers">
                  All Subscribers ({stats.count})
                </SelectItem>
                <SelectItem value="top-buyers">
                  Top Buyers (Top 100 Customers)
                </SelectItem>
                <SelectItem value="all">
                  All (Subscribers + Customers)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Choose your target audience for this campaign
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">📧 Email Preview Tips</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Keep subject lines under 50 characters</li>
              <li>• Include a clear call-to-action</li>
              <li>• Test on mobile devices</li>
              <li>• Always include an unsubscribe link (auto-added)</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSend}
              disabled={sending || !formData.subject || !formData.html}
              className="flex-1"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Newsletter
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setFormData({ subject: "", html: "", segment: "subscribers" })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "New Product Launch",
                subject: "Introducing Our Latest Product! 🎉",
                content: "<h2>Exciting News!</h2><p>We're thrilled to announce our newest addition...</p>",
              },
              {
                name: "Seasonal Sale",
                subject: "Limited Time: 20% Off Everything!",
                content: "<h2>Special Offer</h2><p>For a limited time, enjoy 20% off our entire collection...</p>",
              },
              {
                name: "Beauty Tips",
                subject: "5 Tips for Glowing Skin",
                content: "<h2>Your Weekly Beauty Tips</h2><p>Here are our expert-approved tips for radiant skin...</p>",
              },
            ].map((template) => (
              <Card
                key={template.name}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  setFormData({
                    ...formData,
                    subject: template.subject,
                    html: template.content,
                  })
                }
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



