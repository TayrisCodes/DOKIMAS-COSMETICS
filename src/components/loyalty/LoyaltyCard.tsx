"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Award } from "lucide-react";

interface LoyaltyCardProps {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  nextMilestone?: number;
}

export default function LoyaltyCard({
  points,
  totalEarned,
  totalRedeemed,
  nextMilestone = 500,
}: LoyaltyCardProps) {
  const pointsValue = (points / 2).toFixed(2); // Assuming 2:1 redemption rate

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Your Loyalty Points</CardTitle>
          <Gift className="h-6 w-6" />
        </div>
        <CardDescription className="text-purple-100">
          Redeem points for instant discounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Points */}
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{points}</div>
            <p className="text-sm text-purple-100">
              Points (~{pointsValue} ETB value)
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Total Earned</span>
              </div>
              <div className="text-2xl font-bold">{totalEarned}</div>
            </div>

            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4" />
                <span className="text-xs">Redeemed</span>
              </div>
              <div className="text-2xl font-bold">{totalRedeemed}</div>
            </div>
          </div>

          {/* Next Milestone */}
          {points < nextMilestone && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Next Reward</span>
                <Badge variant="secondary" className="bg-white/30 text-white">
                  {nextMilestone} points
                </Badge>
              </div>
              <div className="text-xs text-purple-100">
                {nextMilestone - points} points to go!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



