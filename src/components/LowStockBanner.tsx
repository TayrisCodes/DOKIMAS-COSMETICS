"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

interface LowStockBannerProps {
  count: number;
}

export default function LowStockBanner({ count }: LowStockBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || count === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg relative">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Low Stock Alert
          </h3>
          <div className="mt-1 text-sm text-red-700">
            <strong>{count}</strong> product{count > 1 ? "s" : ""} {count > 1 ? "are" : "is"} running low on stock and need{count > 1 ? "" : "s"} immediate restocking.
          </div>
          <div className="mt-3">
            <Button asChild variant="outline" size="sm" className="border-red-600 text-red-700 hover:bg-red-50">
              <Link href="/dashboard/admin/inventory?lowStock=true">
                View Low Stock Products
              </Link>
            </Button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setDismissed(true)}
            className="inline-flex text-red-400 hover:text-red-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}





