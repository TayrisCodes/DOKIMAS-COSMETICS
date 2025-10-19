"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Award, Info } from "lucide-react";
import { toast } from "sonner";

interface PointsRedemptionProps {
  orderTotal: number;
  onPointsApplied: (points: number, discount: number) => void;
  onPointsCleared: () => void;
  appliedPoints?: number;
}

export default function PointsRedemption({
  orderTotal,
  onPointsApplied,
  onPointsCleared,
  appliedPoints,
}: PointsRedemptionProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPointsBalance();
  }, []);

  useEffect(() => {
    if (usePoints && pointsToUse >= 50) {
      calculateDiscount();
    } else {
      setDiscount(0);
    }
  }, [pointsToUse, usePoints]);

  const fetchPointsBalance = async () => {
    try {
      const response = await fetch("/api/loyalty");
      const data = await response.json();

      if (data.success) {
        setAvailablePoints(data.data.points || 0);
        
        // Calculate max points based on 50% of order total
        const maxDiscount = orderTotal * 0.5;
        const maxPts = Math.floor(maxDiscount * 2); // 2:1 redemption rate
        const userMax = Math.min(maxPts, data.data.points);
        setMaxPoints(userMax);
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = async () => {
    try {
      const response = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: pointsToUse,
          orderTotal,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDiscount(data.data.discount);
      }
    } catch (error) {
      console.error("Error calculating discount:", error);
    }
  };

  const applyPoints = () => {
    if (pointsToUse < 50) {
      toast.error("Minimum 50 points required");
      return;
    }
    
    onPointsApplied(pointsToUse, discount);
    toast.success(`${pointsToUse} points applied for ${discount.toFixed(2)} ETB discount`);
  };

  const clearPoints = () => {
    setUsePoints(false);
    setPointsToUse(0);
    setDiscount(0);
    onPointsCleared();
    toast.success("Points cleared");
  };

  if (loading || availablePoints === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">Use Loyalty Points</h3>
            </div>
            <Badge variant="outline" className="font-mono">
              {availablePoints} pts available
            </Badge>
          </div>

          {/* Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-points"
              checked={usePoints}
              onCheckedChange={(checked) => {
                setUsePoints(checked as boolean);
                if (!checked) clearPoints();
              }}
            />
            <label
              htmlFor="use-points"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Redeem points for instant discount
            </label>
          </div>

          {/* Points Slider */}
          {usePoints && (
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Select points to use:</span>
                  <span className="font-bold text-purple-600">{pointsToUse} points</span>
                </div>
                <Slider
                  value={[pointsToUse]}
                  onValueChange={(value) => setPointsToUse(value[0])}
                  min={0}
                  max={maxPoints}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>Max: {maxPoints}</span>
                </div>
              </div>

              {/* Discount Preview */}
              {pointsToUse >= 50 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Your Discount:</span>
                    <span className="text-xl font-bold text-purple-600">
                      -{discount.toFixed(2)} ETB
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Remaining: {availablePoints - pointsToUse} points
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start space-x-2 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>• Minimum 50 points required to redeem</p>
                  <p>• 100 points = 50 ETB discount</p>
                  <p>• Max 50% of order total can be covered</p>
                </div>
              </div>

              {/* Apply/Clear Buttons */}
              {!appliedPoints ? (
                <Button
                  onClick={applyPoints}
                  disabled={pointsToUse < 50}
                  className="w-full"
                  variant="outline"
                >
                  Apply {pointsToUse} Points
                </Button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">
                      ✓ {appliedPoints} points applied
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearPoints}
                      className="text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



