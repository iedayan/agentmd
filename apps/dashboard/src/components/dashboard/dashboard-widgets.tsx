"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  GitBranch,
  Users,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface RealTimeMetric {
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  unit?: string;
}

interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const [metrics, setMetrics] = useState({
    activeRepos: { value: 12, change: 2, trend: "up" as const },
    successRate: { value: 94.5, change: 1.2, trend: "up" as const, unit: "%" },
    avgExecutionTime: { value: 2.3, change: -0.5, trend: "down" as const, unit: "s" },
    activeUsers: { value: 8, change: 0, trend: "neutral" as const }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeRepos: { 
          ...prev.activeRepos, 
          value: prev.activeRepos.value + (Math.random() > 0.8 ? 1 : 0)
        },
        successRate: { 
          ...prev.successRate, 
          value: Math.min(100, Math.max(85, prev.successRate.value + (Math.random() - 0.5) * 2))
        },
        avgExecutionTime: { 
          ...prev.avgExecutionTime, 
          value: Math.max(1.5, prev.avgExecutionTime.value + (Math.random() - 0.5) * 0.3)
        },
        activeUsers: { 
          ...prev.activeUsers, 
          value: prev.activeUsers.value + (Math.random() > 0.9 ? 1 : Math.random() > 0.95 ? -1 : 0)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const stats = [
    {
      title: "Active Repositories",
      value: metrics.activeRepos.value,
      change: metrics.activeRepos.change,
      trend: metrics.activeRepos.trend,
      icon: <GitBranch className="h-5 w-5" />,
      description: "Connected repositories"
    },
    {
      title: "Success Rate",
      value: metrics.successRate.value,
      change: metrics.successRate.change,
      trend: metrics.successRate.trend,
      unit: metrics.successRate.unit,
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Pipeline success rate"
    },
    {
      title: "Avg Execution Time",
      value: metrics.avgExecutionTime.value,
      change: metrics.avgExecutionTime.change,
      trend: metrics.avgExecutionTime.trend,
      unit: metrics.avgExecutionTime.unit,
      icon: <Clock className="h-5 w-5" />,
      description: "Average execution duration"
    },
    {
      title: "Active Users",
      value: metrics.activeUsers.value,
      change: metrics.activeUsers.change,
      trend: metrics.activeUsers.trend,
      icon: <Users className="h-5 w-5" />,
      description: "Team members online"
    }
  ];

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              {stat.icon}
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </div>
            {getTrendIcon(stat.trend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}
              {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={getTrendColor(stat.trend)}>
                {stat.trend === "up" ? "+" : stat.trend === "down" ? "" : ""}
                {stat.change}
                {stat.unit && stat.unit}
              </span>
              <span>from last hour</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
          {/* Animated background effect */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary/5 animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const [activities, setActivities] = useState([
    {
      id: "1",
      type: "success",
      title: "Pipeline completed",
      description: "agentmd/core pipeline completed successfully",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      user: "John Doe"
    },
    {
      id: "2", 
      type: "warning",
      title: "Health score drop",
      description: "agentmd/analytics health dropped to 72%",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: "System"
    },
    {
      id: "3",
      type: "info",
      title: "New repository connected",
      description: "agentmd/ui repository was connected",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: "Jane Smith"
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now().toString(),
        type: ["success", "warning", "info"][Math.floor(Math.random() * 3)] as "success" | "warning" | "info",
        title: "System update",
        description: "Background sync completed",
        timestamp: new Date(),
        user: "System"
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-time Activity
        </CardTitle>
        <CardDescription>Latest system events and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      title: "Run Pipeline",
      description: "Execute agent pipeline",
      icon: <Zap className="h-4 w-4" />,
      href: "/dashboard/executions",
      variant: "default" as const
    },
    {
      title: "Connect Repository",
      description: "Add new repository",
      icon: <GitBranch className="h-4 w-4" />,
      href: "/dashboard/repositories",
      variant: "outline" as const
    },
    {
      title: "View Analytics",
      description: "Performance metrics",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/dashboard/analytics",
      variant: "outline" as const
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="w-full justify-start gap-2"
              asChild
            >
              <a href={action.href}>
                {action.icon}
                <div className="text-left">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
