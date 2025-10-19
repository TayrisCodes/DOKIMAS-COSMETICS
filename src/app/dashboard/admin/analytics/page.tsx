"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import StatCard from "@/components/StatCard";
import LowStockBanner from "@/components/LowStockBanner";
import { RevenueChart, TopProductsChart, CategoryChart } from "@/components/Charts";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Download,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState("7"); // days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsRes = await fetch("/api/analytics");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch revenue data
      const revenueRes = await fetch(`/api/analytics/revenue?days=${dateRange}`);
      const revenueDataRes = await revenueRes.json();
      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.data.data || []);
      }

      // Fetch top products
      const productsRes = await fetch(`/api/analytics/products?days=${dateRange}&limit=5`);
      const productsData = await productsRes.json();
      if (productsData.success) {
        setTopProducts(productsData.data.topProducts || []);
        setCategoryData(productsData.data.categoryBreakdown || []);
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

  const handleExport = () => {
    toast.success("Export functionality coming soon");
    // Future: Generate Excel/PDF report
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats && stats.lowStockCount > 0 && (
        <LowStockBanner count={stats.lowStockCount} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
          icon={DollarSign}
          description="All-time revenue"
          trend={stats?.growth?.monthly}
          color="text-green-600"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${stats?.todayRevenue?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          description="Revenue today"
          color="text-blue-600"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          description={`${stats?.todayOrders || 0} today`}
          color="text-purple-600"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          description="Need restocking"
          color="text-red-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={revenueData} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryChart data={categoryData} />
        
        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-lg font-bold">{stats?.totalProducts || 0}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="text-lg font-bold">
                ${stats?.totalOrders > 0 
                  ? (stats.totalRevenue / stats.totalOrders).toFixed(2) 
                  : "0.00"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Weekly Growth</span>
              <span className={`text-lg font-bold ${
                (stats?.growth?.weekly || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats?.growth?.weekly >= 0 ? "+" : ""}
                {stats?.growth?.weekly?.toFixed(1) || 0}%
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Growth</span>
              <span className={`text-lg font-bold ${
                (stats?.growth?.monthly || 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats?.growth?.monthly >= 0 ? "+" : ""}
                {stats?.growth?.monthly?.toFixed(1) || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products This Period</CardTitle>
          <CardDescription>Best performing products in selected range</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">
                      ${product.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.totalQuantity} units sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No sales data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





