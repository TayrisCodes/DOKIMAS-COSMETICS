"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  MapPin, 
  CreditCard, 
  Upload, 
  CheckCircle, 
  Loader2,
  ShoppingCart,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import CouponInput from "@/components/checkout/CouponInput";
import PointsRedemption from "@/components/checkout/PointsRedemption";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment Upload
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Discounts
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [appliedPoints, setAppliedPoints] = useState<number>(0);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);

  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Ethiopia",
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "",
    paymentReference: "",
    paymentProof: null as File | null,
  });

  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      
      if (data.success) {
        if (!data.data || data.data.items.length === 0) {
          toast.error("Your cart is empty");
          router.push("/shop");
          return;
        }
        setCart(data.data);
      } else {
        toast.error("Failed to load cart");
        router.push("/cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create order with discount data
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shippingForm,
          paymentMethod: paymentForm.paymentMethod || "telebirr",
          notes,
          couponCode: appliedCoupon?.code,
          couponDiscount: appliedCoupon?.discount || 0,
          pointsUsed: appliedPoints,
          pointsDiscount: pointsDiscount,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderId(data.data._id);
        setStep(2);
        toast.success("Order created! Please upload your payment proof.");
      } else {
        toast.error(data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.paymentProof || !paymentForm.paymentReference) {
      toast.error("Please upload payment proof and enter reference number");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", orderId!);
      formData.append("paymentReference", paymentForm.paymentReference);
      formData.append("paymentProof", paymentForm.paymentProof);

      const response = await fetch("/api/payments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Payment proof uploaded successfully!");
        setStep(3);
      } else {
        toast.error(data.error || "Failed to upload payment proof");
      }
    } catch (error) {
      console.error("Error uploading payment:", error);
      toast.error("Failed to upload payment proof");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // Step 3: Success Screen
  if (step === 3) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your order!
              </p>
              <p className="text-gray-600">
                We've received your payment proof and will verify it within 24 hours.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <p className="text-sm text-blue-900">
                  <strong>What's next?</strong><br />
                  You'll receive an email once your payment is verified.<br />
                  We'll send tracking information when your order ships.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/dashboard/customer/orders">
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const shipping = subtotal >= 50 ? 0 : 5;
  const couponDiscount = appliedCoupon?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const total = Math.max(subtotal + shipping - totalDiscount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <div className="flex items-center space-x-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 2 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <>
              {/* Discounts Section */}
              <div className="space-y-6 mb-6">
                {/* Coupon Input */}
                <Card>
                  <CardContent className="pt-6">
                    <CouponInput
                      orderTotal={subtotal + shipping}
                      onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                      onCouponRemoved={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                    />
                  </CardContent>
                </Card>

                {/* Points Redemption */}
                <PointsRedemption
                  orderTotal={subtotal + shipping - (appliedCoupon?.discount || 0)}
                  onPointsApplied={(points, discount) => {
                    setAppliedPoints(points);
                    setPointsDiscount(discount);
                  }}
                  onPointsCleared={() => {
                    setAppliedPoints(0);
                    setPointsDiscount(0);
                  }}
                  appliedPoints={appliedPoints}
                />
              </div>

              {/* Shipping Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                  <CardDescription>
                    Where should we deliver your order?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        placeholder="+251 911 234 567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={shippingForm.street}
                      onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        placeholder="Addis Ababa"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Region *</Label>
                      <Input
                        id="state"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        placeholder="Addis Ababa"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingForm.zipCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                        placeholder="1000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingForm.country}
                      onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telebirr">TeleBirr</SelectItem>
                        <SelectItem value="cbe_birr">CBE Birr</SelectItem>
                        <SelectItem value="cash">Cash on Delivery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      You'll upload payment proof in the next step
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special instructions for your order..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/cart")}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Cart
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </>
          )}

          {/* Step 2: Payment Upload */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Upload Payment Proof
                </CardTitle>
                <CardDescription>
                  Complete your payment and upload the confirmation screenshot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Payment Instructions */}
                  <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Payment Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Complete your payment via {paymentForm.paymentMethod || "your selected method"}</li>
                      <li>Take a screenshot of the payment confirmation</li>
                      <li>Upload the screenshot below</li>
                      <li>Enter the transaction reference number</li>
                      <li>We'll verify your payment within 24 hours</li>
                    </ol>

                    {paymentForm.paymentMethod === "telebirr" && (
                      <div className="bg-white p-4 rounded-lg mt-4">
                        <p className="font-medium mb-2">TeleBirr Payment Details:</p>
                        <p className="text-sm">Amount: <strong>${total.toFixed(2)}</strong></p>
                        <p className="text-sm">Merchant: <strong>Dokimas Cosmetics</strong></p>
                      </div>
                    )}

                    {paymentForm.paymentMethod === "cbe_birr" && (
                      <div className="bg-white p-4 rounded-lg mt-4">
                        <p className="font-medium mb-2">CBE Birr Payment Details:</p>
                        <p className="text-sm">Amount: <strong>${total.toFixed(2)}</strong></p>
                        <p className="text-sm">Account: <strong>1000123456789</strong></p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handlePaymentUpload} className="space-y-6">
                    {/* Upload Payment Proof */}
                    <div>
                      <Label htmlFor="paymentProof">Payment Screenshot *</Label>
                      <div className="mt-2">
                        <label
                          htmlFor="paymentProof"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, WebP (MAX. 5MB)</p>
                          </div>
                          <input
                            id="paymentProof"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPaymentForm({ ...paymentForm, paymentProof: file });
                                toast.success(`File selected: ${file.name}`);
                              }
                            }}
                          />
                        </label>
                        {paymentForm.paymentProof && (
                          <div className="mt-2 text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {paymentForm.paymentProof.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transaction Reference */}
                    <div>
                      <Label htmlFor="paymentReference">Transaction Reference Number *</Label>
                      <Input
                        id="paymentReference"
                        value={paymentForm.paymentReference}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                        placeholder="e.g., TXN123456789"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        This is the transaction ID from your payment app
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Payment
                      </Button>
                    </div>
                  </form>

                  {/* Option to skip */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(3)}
                      className="text-sm"
                    >
                      Skip for now (upload later)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart?.items.map((item: any) => (
                  <div key={item.productId._id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.productId.name}</div>
                      <div className="text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* Discounts */}
              {totalDiscount > 0 && (
                <>
                  <Separator />
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Coupon ({appliedCoupon.code})
                      </span>
                      <span className="font-medium text-green-600">
                        -${couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600">
                        Points ({appliedPoints} pts)
                      </span>
                      <span className="font-medium text-purple-600">
                        -${pointsDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-purple-600">${total.toFixed(2)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="bg-green-50 p-3 rounded text-center">
                  <p className="text-sm font-medium text-green-700">
                    You're saving ${totalDiscount.toFixed(2)}! 🎉
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Secure Payment
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  24hr Payment Verification
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  30-Day Returns
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



