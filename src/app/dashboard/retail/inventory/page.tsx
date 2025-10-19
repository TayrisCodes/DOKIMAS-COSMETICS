"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InventoryTable from "@/components/InventoryTable";
import LowStockBanner from "@/components/LowStockBanner";
import { 
  Package, 
  AlertTriangle,
  RefreshCw,
  Mail
} from "lucide-react";
import { toast } from "sonner";

export default function RetailInventoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products || []);
        setLowStockCount(data.data.lowStockCount || 0);
      } else {
        toast.error(data.error || "Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
    toast.success("Inventory refreshed");
  };

  const requestRestock = async () => {
    toast.success("Restock request sent to admin");
    // Future: Send email to admin
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Inventory</h1>
          <p className="text-gray-600 mt-2">View and manage store stock</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {lowStockCount > 0 && (
            <Button onClick={requestRestock} className="bg-red-600 hover:bg-red-700">
              <Mail className="mr-2 h-4 w-4" />
              Request Restock ({lowStockCount})
            </Button>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && <LowStockBanner count={lowStockCount} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.stock > 0).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.stock === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Stock Levels</CardTitle>
          <CardDescription>
            Current inventory with stock adjustment controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable products={products} onStockUpdate={fetchInventory} />
        </CardContent>
      </Card>
    </div>
  );
}
