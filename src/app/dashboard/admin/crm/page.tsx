"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatCard from "@/components/StatCard";
import CRMTable from "@/components/crm/CRMTable";
import { Users, TrendingUp, Award, RefreshCw, Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminCRMPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [emailType, setEmailType] = useState("promo");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/crm/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch customers
      const statusParam = filter === "all" ? "" : `?status=${filter}`;
      const customersRes = await fetch(`/api/crm/customers${statusParam}`);
      const customersData = await customersRes.json();
      if (customersData.success) {
        setCustomers(customersData.data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error("Failed to load CRM data");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCustomers = (customerIds: string[]) => {
    setSelectedCustomerIds(customerIds);
    setEmailModalOpen(true);
  };

  const sendEmail = async () => {
    if (selectedCustomerIds.length === 0) {
      toast.error("No customers selected");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/crm/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerIds: selectedCustomerIds,
          emailType,
          customMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Email sent to ${data.data.sent} customer(s)`);
        setEmailModalOpen(false);
        setCustomMessage("");
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setSending(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage customer relationships and engagement</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          description={`${stats?.newCustomers || 0} new this month`}
          color="text-blue-600"
        />
        <StatCard
          title="Active Customers"
          value={stats?.activeCustomers || 0}
          icon={TrendingUp}
          description="Ordered in last 60 days"
          color="text-green-600"
        />
        <StatCard
          title="Points Issued"
          value={stats?.loyaltyPoints?.totalIssued || 0}
          icon={Award}
          description={`${stats?.loyaltyPoints?.active || 0} active`}
          color="text-purple-600"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${stats?.averageOrderValue?.toFixed(2) || "0.00"}`}
          icon={TrendingUp}
          description="Across all customers"
          color="text-orange-600"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage your customer base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Label>Filter by Status:</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CRMTable customers={customers} onEmailSelected={handleEmailCustomers} />
        </CardContent>
      </Card>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to Customers</DialogTitle>
            <DialogDescription>
              Sending to {selectedCustomerIds.length} customer(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Email Type</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Promotional</SelectItem>
                  <SelectItem value="reward">Loyalty Reward</SelectItem>
                  <SelectItem value="inactivity">Re-engagement</SelectItem>
                  <SelectItem value="appreciation">Thank You</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Custom Message (Optional)</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={4}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={sendEmail}
                disabled={sending}
                className="flex-1"
              >
                <Mail className="mr-2 h-4 w-4" />
                {sending ? "Sending..." : "Send Email"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEmailModalOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



