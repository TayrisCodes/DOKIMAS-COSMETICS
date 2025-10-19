"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Save, Calculator } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    pointsPerAmount: 10,
    redeemRate: 2,
    minRedeemPoints: 50,
    maxRedeemPercent: 50,
    pointsExpireDays: 0,
    welcomePoints: 100,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/loyalty/config");
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/loyalty/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Configuration saved successfully");
      } else {
        toast.error(data.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const calculateExample = () => {
    const exampleOrder = 500; // ETB
    const pointsEarned = Math.floor(exampleOrder / config.pointsPerAmount);
    const pointsToRedeem = 100;
    const discount = pointsToRedeem / config.redeemRate;
    
    return { pointsEarned, discount };
  };

  const example = calculateExample();

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
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Loyalty Configuration</h1>
        <p className="text-gray-600 mt-2">Configure how customers earn and redeem loyalty points</p>
      </div>

      {/* Configuration Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Points Settings</CardTitle>
          <CardDescription>Customize your loyalty rewards program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Per Amount */}
            <div>
              <Label>Points Per Amount Spent (ETB)</Label>
              <Input
                type="number"
                value={config.pointsPerAmount}
                onChange={(e) =>
                  setConfig({ ...config, pointsPerAmount: parseInt(e.target.value) || 1 })
                }
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Customer earns 1 point per {config.pointsPerAmount} ETB spent
              </p>
            </div>

            {/* Redeem Rate */}
            <div>
              <Label>Redemption Rate</Label>
              <Input
                type="number"
                value={config.redeemRate}
                onChange={(e) =>
                  setConfig({ ...config, redeemRate: parseInt(e.target.value) || 1 })
                }
                min="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                100 points = {(100 / config.redeemRate).toFixed(2)} ETB discount
              </p>
            </div>

            {/* Min Redeem Points */}
            <div>
              <Label>Minimum Points to Redeem</Label>
              <Input
                type="number"
                value={config.minRedeemPoints}
                onChange={(e) =>
                  setConfig({ ...config, minRedeemPoints: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum points required for redemption
              </p>
            </div>

            {/* Max Redeem Percent */}
            <div>
              <Label>Max Redemption Percentage (%)</Label>
              <Input
                type="number"
                value={config.maxRedeemPercent}
                onChange={(e) =>
                  setConfig({ ...config, maxRedeemPercent: parseInt(e.target.value) || 50 })
                }
                min="0"
                max="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Max {config.maxRedeemPercent}% of order can be covered by points
              </p>
            </div>

            {/* Welcome Points */}
            <div>
              <Label>Welcome Bonus Points</Label>
              <Input
                type="number"
                value={config.welcomePoints}
                onChange={(e) =>
                  setConfig({ ...config, welcomePoints: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Points awarded on registration
              </p>
            </div>

            {/* Points Expiry */}
            <div>
              <Label>Points Expiry (days, 0 = never)</Label>
              <Input
                type="number"
                value={config.pointsExpireDays}
                onChange={(e) =>
                  setConfig({ ...config, pointsExpireDays: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                {config.pointsExpireDays === 0
                  ? "Points never expire"
                  : `Points expire after ${config.pointsExpireDays} days`}
              </p>
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Preview Calculator
          </CardTitle>
          <CardDescription>See how the configuration works in practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Example Scenario:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded">
                <span>Customer spends 500 ETB</span>
                <Badge className="bg-green-600">+{example.pointsEarned} points</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded">
                <span>Customer redeems 100 points</span>
                <Badge className="bg-blue-600">-{example.discount} ETB discount</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded">
                <span>New registration bonus</span>
                <Badge className="bg-purple-600">+{config.welcomePoints} points</Badge>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-gray-600 space-y-1">
              <p>• Earn rate: 1 point per {config.pointsPerAmount} ETB</p>
              <p>• Redeem rate: 100 points = {(100 / config.redeemRate).toFixed(2)} ETB</p>
              <p>• Min to redeem: {config.minRedeemPoints} points</p>
              <p>• Max coverage: {config.maxRedeemPercent}% of order total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



