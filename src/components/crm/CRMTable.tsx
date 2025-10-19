"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Eye } from "lucide-react";
import Link from "next/link";

interface Customer {
  userId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  points: number;
  lastOrderDate?: Date;
  lastLogin?: Date;
  activityStatus?: "active" | "inactive" | "new";
}

interface CRMTableProps {
  customers: Customer[];
  onEmailSelected?: (customerIds: string[]) => void;
}

export default function CRMTable({ customers, onEmailSelected }: CRMTableProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleAll = () => {
    setSelectedCustomers(
      selectedCustomers.length === customers.length
        ? []
        : customers.map((c) => c.userId)
    );
  };

  const handleEmailSelected = () => {
    if (onEmailSelected && selectedCustomers.length > 0) {
      onEmailSelected(selectedCustomers);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "new":
        return <Badge className="bg-blue-600">New</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div>
      {/* Actions Bar */}
      {selectedCustomers.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
          <span className="font-medium">
            {selectedCustomers.length} customer(s) selected
          </span>
          <Button onClick={handleEmailSelected} size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">
                <Checkbox
                  checked={selectedCustomers.length === customers.length}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="text-left py-3 px-4 font-medium">Customer</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Orders</th>
              <th className="text-center py-3 px-4 font-medium">Total Spent</th>
              <th className="text-center py-3 px-4 font-medium">Points</th>
              <th className="text-left py-3 px-4 font-medium">Last Order</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.userId}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <Checkbox
                    checked={selectedCustomers.includes(customer.userId)}
                    onCheckedChange={() => toggleCustomer(customer.userId)}
                  />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(customer.activityStatus)}
                </td>
                <td className="py-4 px-4 text-center">{customer.totalOrders}</td>
                <td className="py-4 px-4 text-center font-medium text-green-600">
                  ${customer.totalSpent.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-center">
                  <Badge variant="outline" className="font-mono">
                    {customer.points} pts
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="py-4 px-4 text-center">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <Link href={`/dashboard/admin/crm/${customer.userId}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <User className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}



