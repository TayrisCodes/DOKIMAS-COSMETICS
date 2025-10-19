"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoyaltyCard from "@/components/loyalty/LoyaltyCard";
import RewardProgress from "@/components/loyalty/RewardProgress";
import { RefreshCw, ShoppingCart, History } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomerLoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/loyalty");
      const data = await response.json();

      if (data.success) {
        setLoyaltyData(data.data);
      } else {
        toast.error("Failed to load loyalty data");
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      toast.error("Failed to load loyalty data");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Rewards</h1>
          <p className="text-gray-600 mt-2">Earn points with every purchase and redeem for discounts</p>
        </div>
        <Button variant="outline" onClick={fetchLoyaltyData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Loyalty Card */}
        <div className="lg:col-span-2">
          <LoyaltyCard
            points={loyaltyData?.points || 0}
            totalEarned={loyaltyData?.totalEarned || 0}
            totalRedeemed={loyaltyData?.totalRedeemed || 0}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/shop">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shop & Earn Points
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/cart">
                Redeem at Checkout
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <RewardProgress
          currentPoints={loyaltyData?.points || 0}
          targetPoints={500}
          rewardName="Gold Tier Status"
        />
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How Loyalty Rewards Work</CardTitle>
          <CardDescription>Earn and redeem points easily</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="font-semibold mb-2">Shop</h3>
              <p className="text-sm text-gray-600">
                Earn 1 point for every 10 ETB spent on any purchase
              </p>
            </div>
            <div className="text-center p-6 bg-pink-50 rounded-lg">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold mb-2">Redeem</h3>
              <p className="text-sm text-gray-600">
                Use 100 points to get 50 ETB off your next order
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-semibold mb-2">Enjoy</h3>
              <p className="text-sm text-gray-600">
                Points never expire! Save up for bigger discounts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest points transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loyaltyData?.recentHistory && loyaltyData.recentHistory.length > 0 ? (
            <div className="space-y-4">
              {loyaltyData.recentHistory.map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={transaction.action === "earn" ? "default" : "secondary"}
                    className={
                      transaction.action === "earn"
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }
                  >
                    {transaction.action === "earn" ? "+" : "-"}
                    {Math.abs(transaction.points)} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No transactions yet</p>
              <p className="text-sm mt-2">Start shopping to earn points!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




