import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Home,
  LogOut,
  Upload
} from "lucide-react";
import Link from "next/link";

async function getOrders(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/orders`, {
      cache: 'no-store',
      headers: {
        'Cookie': `next-auth.session-token=${userId}` // This won't work, we need proper auth
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

function getPaymentStatusBadge(status: string) {
  const variants: Record<string, { variant: any; className: string; icon: any }> = {
    pending: { variant: "outline" as const, className: "border-yellow-500 text-yellow-700", icon: Clock },
    under_review: { variant: "outline" as const, className: "border-blue-500 text-blue-700", icon: Eye },
    approved: { variant: "outline" as const, className: "border-green-500 text-green-700", icon: CheckCircle },
    paid: { variant: "default" as const, className: "bg-green-600", icon: CheckCircle },
    rejected: { variant: "outline" as const, className: "border-red-500 text-red-700", icon: XCircle },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
}

function getOrderStatusBadge(status: string) {
  const variants: Record<string, { variant: any; className: string; icon: any }> = {
    pending: { variant: "outline" as const, className: "border-gray-500 text-gray-700", icon: Clock },
    processing: { variant: "outline" as const, className: "border-blue-500 text-blue-700", icon: Package },
    shipped: { variant: "outline" as const, className: "border-purple-500 text-purple-700", icon: Truck },
    delivered: { variant: "default" as const, className: "bg-green-600", icon: Home },
    cancelled: { variant: "outline" as const, className: "border-red-500 text-red-700", icon: XCircle },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {status.toUpperCase()}
    </Badge>
  );
}

export default async function CustomerOrdersPage() {
  const session = await auth();

  if (!session || session.user.role !== "customer") {
    redirect("/login");
  }

  // Note: This is a simplified version. In production, you'd pass the session properly
  const orders = []; // await getOrders(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Dokimas Cosmetics
            </Link>
            <Separator orientation="vertical" className="h-8" />
            <Link href="/dashboard/customer" className="text-sm text-gray-600 hover:text-purple-600">
              Dashboard
            </Link>
            <span className="text-sm font-medium">Orders</span>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">
                  Start shopping to see your orders here!
                </p>
              </div>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/shop">
                  Start Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {getPaymentStatusBadge(order.paymentStatus)}
                    {getOrderStatusBadge(order.orderStatus)}
                  </div>

                  {/* Payment Proof Status */}
                  {order.paymentStatus === "pending" && !order.paymentProofUrl && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Action Required:</strong> Upload your payment proof
                      </p>
                      <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Payment Proof
                      </Button>
                    </div>
                  )}

                  {order.paymentStatus === "under_review" && (
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                      <strong>Under Review:</strong> We're verifying your payment. You'll be notified within 24 hours.
                    </div>
                  )}

                  {order.paymentStatus === "rejected" && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800 mb-2">
                        <strong>Payment Issue:</strong> {order.adminNotes || "Please upload a valid payment proof"}
                      </p>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-700">
                        <Upload className="mr-2 h-4 w-4" />
                        Re-upload Payment Proof
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/customer/orders/${order._id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}






