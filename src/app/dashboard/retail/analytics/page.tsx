"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/StatCard";
import { RevenueChart, TopProductsChart } from "@/components/Charts";
import { 
  DollarSign, 
  ShoppingCart, 
  Package,
  RefreshCw,
  TrendingUp,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function RetailAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch retail-specific stats
      const statsRes = await fetch("/api/analytics?source=retail");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch revenue data (last 7 days)
      const revenueRes = await fetch("/api/analytics/revenue?days=7");
      const revenueDataRes = await revenueRes.json();
      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.data.data || []);
      }

      // Fetch top products
      const productsRes = await fetch("/api/analytics/products?days=7&limit=5");
      const productsData = await productsRes.json();
      if (productsData.success) {
        setTopProducts(productsData.data.topProducts || []);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Analytics refreshed");
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
          <h1 className="text-3xl font-bold text-gray-900">Retail Analytics</h1>
          <p className="text-gray-600 mt-2">Store performance and sales insights</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Revenue"
          value={`$${stats?.todayRevenue?.toFixed(2) || "0.00"}`}
          icon={DollarSign}
          description="Retail sales today"
          color="text-green-600"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={ShoppingCart}
          description="Completed sales"
          color="text-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          description="All-time retail revenue"
          trend={stats?.growth?.weekly}
          color="text-purple-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          description="Need attention"
          color="text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
          <CardDescription>Real-time sales summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats?.todayRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sales</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.todayOrders || 0}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg. Sale</p>
              <p className="text-2xl font-bold text-purple-600">
                ${stats?.todayOrders > 0 
                  ? (stats.todayRevenue / stats.todayOrders).toFixed(2) 
                  : "0.00"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





