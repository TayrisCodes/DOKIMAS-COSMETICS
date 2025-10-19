"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import CRMTable from "@/components/crm/CRMTable";
import { Users, TrendingUp, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RetailCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all customers
      const customersRes = await fetch("/api/crm/customers");
      const customersData = await customersRes.json();
      if (customersData.success) {
        setCustomers(customersData.data.customers || []);
      }

      // Fetch stats
      const statsRes = await fetch("/api/crm/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSelected = async (customerIds: string[]) => {
    toast.info(`Email feature: ${customerIds.length} customers selected`);
    // Modal would open here for email composition
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
          <h1 className="text-3xl font-bold text-gray-900">Store Customers</h1>
          <p className="text-gray-600 mt-2">View and engage with store customers</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          description="All registered customers"
          color="text-blue-600"
        />
        <StatCard
          title="Active Customers"
          value={stats?.activeCustomers || 0}
          icon={TrendingUp}
          description="Ordered recently"
          color="text-green-600"
        />
        <StatCard
          title="Repeat Customers"
          value={customers.filter((c) => c.totalOrders > 1).length}
          icon={Mail}
          description="Multiple orders"
          color="text-purple-600"
        />
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>All customers and their purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          <CRMTable customers={customers} onEmailSelected={handleEmailSelected} />
        </CardContent>
      </Card>
    </div>
  );
}




