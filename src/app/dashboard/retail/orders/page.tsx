import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  Package, 
  Eye, 
  CheckCircle,
  XCircle,
  LogOut,
  ShoppingCart,
  Clock,
  Truck
} from "lucide-react";

function getPaymentStatusBadge(status: string) {
  const config: Record<string, { className: string; icon: any; label: string }> = {
    pending: { className: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
    under_review: { className: "bg-blue-100 text-blue-800", icon: Eye, label: "Under Review" },
    approved: { className: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved" },
    paid: { className: "bg-green-600 text-white", icon: CheckCircle, label: "Paid" },
    rejected: { className: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" },
  };

  const item = config[status] || config.pending;
  const Icon = item.icon;

  return (
    <Badge className={item.className}>
      <Icon className="mr-1 h-3 w-3" />
      {item.label}
    </Badge>
  );
}

function getOrderStatusBadge(status: string) {
  const config: Record<string, { className: string; icon: any; label: string }> = {
    pending: { className: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" },
    processing: { className: "bg-blue-100 text-blue-800", icon: Package, label: "Processing" },
    shipped: { className: "bg-purple-100 text-purple-800", icon: Truck, label: "Shipped" },
    delivered: { className: "bg-green-600 text-white", icon: CheckCircle, label: "Delivered" },
    cancelled: { className: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
  };

  const item = config[status] || config.pending;
  const Icon = item.icon;

  return (
    <Badge className={item.className}>
      <Icon className="mr-1 h-3 w-3" />
      {item.label}
    </Badge>
  );
}

export default async function RetailOrdersPage() {
  const session = await auth();

  if (!session || session.user.role !== "retail_manager") {
    redirect("/login");
  }

  const orders: any[] = []; // In production, fetch from API

  const stats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.paymentStatus === "pending").length,
    underReview: orders.filter((o: any) => o.paymentStatus === "under_review").length,
    today: orders.filter((o: any) => {
      const today = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === today;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-purple-600">Dokimas Cosmetics</h1>
            <p className="text-sm text-gray-600">Retail Manager - Order Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/retail">Dashboard</Link>
            </Button>
            <form action={async () => {
              "use server";
              await signOut({ redirect: true, redirectTo: "/" });
            }}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h2>
          <p className="text-gray-600">Review and process customer orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Recent orders requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here once customers place them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order._id} className="border-l-4 border-blue-600">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            {getPaymentStatusBadge(order.paymentStatus)}
                            {getOrderStatusBadge(order.orderStatus)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Customer: {order.userId?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} item(s) • ${order.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/retail/orders/${order._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          {order.paymentStatus === "under_review" && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}





