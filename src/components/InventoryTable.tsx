"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Minus, History, Package, AlertTriangle } from "lucide-react";

interface InventoryTableProps {
  products: any[];
  onStockUpdate?: () => void;
}

export default function InventoryTable({ products, onStockUpdate }: InventoryTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<{ [key: string]: number }>({});

  const handleStockAdjustment = async (productId: string, action: "add" | "remove") => {
    const quantity = adjustmentQty[productId] || 1;
    
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setUpdating(productId);

    try {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          action,
          reason: `Manual ${action === "add" ? "addition" : "removal"} via inventory dashboard`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Stock ${action === "add" ? "added" : "removed"} successfully`);
        setAdjustmentQty({ ...adjustmentQty, [productId]: 1 });
        if (onStockUpdate) onStockUpdate();
      } else {
        toast.error(data.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Product</th>
            <th className="text-left py-3 px-4 font-medium">Category</th>
            <th className="text-center py-3 px-4 font-medium">Current Stock</th>
            <th className="text-center py-3 px-4 font-medium">Threshold</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-center py-3 px-4 font-medium">Adjust Stock</th>
            <th className="text-center py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.stock <= product.restockThreshold;
            
            return (
              <tr
                key={product._id}
                className={`border-b hover:bg-gray-50 ${isLowStock ? "bg-red-50" : ""}`}
              >
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline">{product.category}</Badge>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-lg font-bold ${
                      isLowStock ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-gray-600">{product.restockThreshold}</span>
                </td>
                <td className="py-4 px-4">
                  {isLowStock ? (
                    <Badge variant="destructive" className="flex items-center w-fit">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      In Stock
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      value={adjustmentQty[product._id] || 1}
                      onChange={(e) =>
                        setAdjustmentQty({
                          ...adjustmentQty,
                          [product._id]: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20 text-center"
                      disabled={updating === product._id}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockAdjustment(product._id, "add")}
                      disabled={updating === product._id}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockAdjustment(product._id, "remove")}
                      disabled={updating === product._id}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}





