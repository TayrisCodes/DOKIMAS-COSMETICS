"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied: (coupon: {
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  };
}

export default function CouponInput({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);

  const validateCoupon = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidating(true);
    try {
      const response = await fetch(
        `/api/coupons/${code}?orderTotal=${orderTotal}`
      );
      const data = await response.json();

      if (data.success) {
        // Calculate discount
        const coupon = data.data.coupon;
        let discount = 0;

        if (coupon.discountType === "percent") {
          discount = (orderTotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, orderTotal);
        }

        onCouponApplied({
          code: coupon.code,
          discount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        });

        toast.success(`Coupon applied! ${discount.toFixed(2)} ETB discount`);
        setCode("");
      } else {
        toast.error(data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    toast.success("Coupon removed");
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Coupon Applied: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-700">
                Discount: -{appliedCoupon.discount.toFixed(2)} ETB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Have a coupon code?</h3>
      </div>
      <div className="flex space-x-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          disabled={validating}
          onKeyPress={(e) => e.key === "Enter" && validateCoupon()}
        />
        <Button
          onClick={validateCoupon}
          disabled={validating || !code.trim()}
          variant="outline"
        >
          {validating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
}



