"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "text-purple-600",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && trend !== 0 && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-600">
                  +{trend.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-xs font-medium text-red-600">
                  {trend.toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





