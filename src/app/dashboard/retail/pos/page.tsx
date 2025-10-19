"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2,
  DollarSign,
  CheckCircle,
  Printer,
  Loader2,
  Barcode
} from "lucide-react";

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [todayStats, setTodayStats] = useState({ revenue: 0, salesCount: 0 });

  useEffect(() => {
    fetchTodayStats();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/sales/report?startDate=${today}&endDate=${today}`);
      const data = await response.json();
      
      if (data.success) {
        setTodayStats({
          revenue: data.data.summary.totalRevenue || 0,
          salesCount: data.data.summary.totalSales || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching today's stats:", error);
    }
  };

  const searchProducts = async () => {
    try {
      const response = await fetch(`/api/products?search=${searchTerm}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Only ${product.stock} available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setSearchTerm("");
    setSearchResults([]);
    toast.success("Item added to cart");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item._id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.stock) {
          toast.error(`Only ${item.stock} available`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item._id !== productId));
    toast.success("Item removed");
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm("Clear all items from cart?")) {
      setCart([]);
      toast.success("Cart cleared");
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setProcessing(true);
    try {
      const items = cart.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const response = await fetch("/api/pos/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Sale completed successfully!");
        setCart([]);
        fetchTodayStats();
        
        // Show print receipt option
        if (confirm("Sale completed! Would you like to print a receipt?")) {
          printReceipt(data.data);
        }
      } else {
        toast.error(data.error || "Failed to complete sale");
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      toast.error("Failed to complete sale");
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = (sale: any) => {
    // Create receipt HTML and print
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(getReceiptHTML(sale));
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const getReceiptHTML = (sale: any) => {
    const items = sale.items.map((item: any) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="text-align: right;">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; max-width: 300px; margin: 20px; }
            table { width: 100%; margin: 20px 0; }
            th, td { padding: 5px; }
            .total { font-size: 1.2em; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 style="text-align: center;">DOKIMAS COSMETICS</h2>
          <p style="text-align: center;">Store Receipt</p>
          <hr>
          <p>Date: ${new Date().toLocaleString()}</p>
          <hr>
          <table>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
            ${items}
          </table>
          <hr>
          <p class="total">TOTAL: $${sale.totalAmount.toFixed(2)}</p>
          <p>Payment: ${sale.paymentMethod}</p>
          <hr>
          <p style="text-align: center;">Thank you for your purchase!</p>
          <p style="text-align: center; font-size: 0.8em;">www.dokimascosmetics.com</p>
        </body>
      </html>
    `;
  };

  const total = calculateTotal();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">POS Terminal</h1>
        <p className="text-gray-600">Point of Sale - Record store transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search Products
              </CardTitle>
              <CardDescription>
                Search by name, SKU, or barcode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type product name, SKU, or scan barcode..."
                  className="pl-10 text-lg"
                  autoFocus
                />
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku} • Stock: {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">${product.price}</p>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                          {product.stock > 0 ? "In Stock" : "Out"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Sale Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Current Sale
                </span>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>No items in cart</p>
                  <p className="text-sm">Search and add products to begin</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="w-20 text-right font-bold text-purple-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment & Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Total */}
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">TOTAL AMOUNT</p>
                <p className="text-4xl font-bold text-purple-600">
                  ${total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                </p>
              </div>

              <Separator />

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="telebirr">TeleBirr</SelectItem>
                    <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Complete Sale Button */}
              <Button
                onClick={completeSale}
                disabled={cart.length === 0 || processing}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Complete Sale
                  </>
                )}
              </Button>

              <Separator />

              {/* Today's Stats */}
              <div>
                <h3 className="font-semibold mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-medium">{todayStats.salesCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium text-green-600">
                      ${todayStats.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




