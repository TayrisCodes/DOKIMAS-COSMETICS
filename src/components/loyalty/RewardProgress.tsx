"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface RewardProgressProps {
  currentPoints: number;
  targetPoints: number;
  rewardName?: string;
}

export default function RewardProgress({
  currentPoints,
  targetPoints,
  rewardName = "Next Reward Tier",
}: RewardProgressProps) {
  const progress = Math.min((currentPoints / targetPoints) * 100, 100);
  const pointsNeeded = Math.max(targetPoints - currentPoints, 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">{rewardName}</h3>
          </div>
          <span className="text-sm text-gray-500">
            {currentPoints} / {targetPoints}
          </span>
        </div>

        <Progress value={progress} className="h-3 mb-2" />

        <p className="text-sm text-gray-600">
          {pointsNeeded > 0 ? (
            <>
              <span className="font-medium text-purple-600">{pointsNeeded} points</span> needed to
              unlock
            </>
          ) : (
            <span className="text-green-600 font-medium">Reward unlocked! 🎉</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}



