"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Copy, Trash2, RefreshCw, Percent, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState("active");
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    userUsageLimit: "1",
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, [filter]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/coupons?filter=${filter}`);
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: parseFloat(formData.minPurchase) || 0,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
          usageLimit: parseInt(formData.usageLimit) || 0,
          userUsageLimit: parseInt(formData.userUsageLimit) || 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Coupon created successfully");
        setCreateModalOpen(false);
        setFormData({
          code: "",
          discountType: "percent",
          discountValue: "",
          minPurchase: "",
          maxDiscount: "",
          usageLimit: "",
          userUsageLimit: "1",
          expiresAt: "",
        });
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to create coupon");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to create coupon");
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;

    try {
      const response = await fetch(`/api/coupons/${code}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Coupon deactivated");
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-2">Create and manage discount coupons</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchCoupons}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const usagePercent = coupon.usageLimit > 0
                ? (coupon.usageCount / coupon.usageLimit) * 100
                : 0;
              const isExpired = new Date(coupon.expiresAt) < new Date();

              return (
                <Card key={coupon._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        {coupon.discountType === "percent" ? (
                          <Percent className="h-5 w-5 text-purple-600" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-green-600" />
                        )}
                        <span>{coupon.code}</span>
                      </CardTitle>
                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : coupon.isActive ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Discount */}
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {coupon.discountType === "percent"
                          ? `${coupon.discountValue}%`
                          : `${coupon.discountValue} ETB`}
                      </div>
                      <div className="text-sm text-gray-600">Discount</div>
                    </div>

                    {/* Details */}
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Purchase:</span>
                        <span className="font-medium">{coupon.minPurchase} ETB</span>
                      </div>
                      {coupon.maxDiscount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Discount:</span>
                          <span className="font-medium">{coupon.maxDiscount} ETB</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium">
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Usage */}
                    {coupon.usageLimit > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Usage</span>
                          <span className="font-medium">
                            {coupon.usageCount} / {coupon.usageLimit}
                          </span>
                        </div>
                        <Progress value={usagePercent} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyCouponCode(coupon.code)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {coupons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No {filter} coupons found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>Set up a new discount coupon code</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Coupon Code (leave empty to auto-generate)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
              />
            </div>

            <div>
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Discount Value</Label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                placeholder={formData.discountType === "percent" ? "20" : "100"}
              />
            </div>

            <div>
              <Label>Min Purchase (ETB)</Label>
              <Input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Max Discount (ETB, optional)</Label>
              <Input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="Leave empty for no cap"
              />
            </div>

            <div>
              <Label>Usage Limit (0 = unlimited)</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <Label>Per-User Limit</Label>
              <Input
                type="number"
                value={formData.userUsageLimit}
                onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                placeholder="1"
              />
            </div>

            <div className="col-span-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={handleCreate} className="flex-1">
              Create Coupon
            </Button>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



