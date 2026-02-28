"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Activity, PieChart } from "lucide-react";

interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

interface PerformanceChartProps {
  className?: string;
}

export function PerformanceChart({ className }: PerformanceChartProps) {
  const [data, setData] = useState<ChartData>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [85, 88, 92, 87, 94, 89, 91],
    colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981']
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        values: prev.values.map(v => Math.max(70, Math.min(100, v + (Math.random() - 0.5) * 5)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data.values);
  const averageValue = data.values.reduce((a, b) => a + b, 0) / data.values.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Performance
        </CardTitle>
        <CardDescription>
          Pipeline success rate over the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{averageValue.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Average Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{maxValue}%</div>
              <div className="text-xs text-muted-foreground">Peak Performance</div>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="space-y-2">
            {data.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 text-xs text-muted-foreground">{label}</div>
                <div className="flex-1 relative">
                  <Progress 
                    value={data.values[index]} 
                    className="h-2"
                  />
                  <div className="absolute right-0 -top-1 text-xs font-medium">
                    {data.values[index]}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExecutionTrendProps {
  className?: string;
}

export function ExecutionTrend({ className }: ExecutionTrendProps) {
  const [trendData, setTrendData] = useState({
    current: 156,
    previous: 142,
    trend: 'up' as 'up' | 'down',
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      executions: Math.floor(Math.random() * 20) + 5
    }))
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTrendData(prev => ({
        ...prev,
        current: prev.current + Math.floor((Math.random() - 0.5) * 3),
        hourlyData: prev.hourlyData.map(item => ({
          ...item,
          executions: Math.max(0, item.executions + Math.floor((Math.random() - 0.5) * 2))
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const maxExecutions = Math.max(...trendData.hourlyData.map(d => d.executions));
  const changePercent = ((trendData.current - trendData.previous) / trendData.previous * 100).toFixed(1);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Execution Trend
        </CardTitle>
        <CardDescription>
          24-hour pipeline execution volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{trendData.current}</div>
              <div className="text-xs text-muted-foreground">Total Executions</div>
            </div>
            <Badge 
              variant={trendData.trend === 'up' ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              {changePercent}%
            </Badge>
          </div>

          {/* Simple Line Chart Visualization */}
          <div className="h-32 flex items-end gap-1">
            {trendData.hourlyData.map((data, index) => (
              <div
                key={index}
                className="flex-1 bg-primary rounded-t-sm transition-all duration-500 hover:opacity-80"
                style={{ 
                  height: `${(data.executions / maxExecutions) * 100}%`,
                  opacity: index >= 12 ? 1 : 0.6
                }}
                title={`${data.hour}:00 - ${data.executions} executions`}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RepositoryHealthProps {
  className?: string;
}

export function RepositoryHealth({ className }: RepositoryHealthProps) {
  const [healthData, setHealthData] = useState([
    { name: 'agentmd/core', health: 95, status: 'healthy' },
    { name: 'agentmd/ui', health: 88, status: 'healthy' },
    { name: 'agentmd/api', health: 72, status: 'warning' },
    { name: 'agentmd/docs', health: 91, status: 'healthy' },
    { name: 'agentmd/cli', health: 85, status: 'healthy' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealthData(prev => prev.map(repo => ({
        ...repo,
        health: Math.max(60, Math.min(100, repo.health + (Math.random() - 0.5) * 3))
      })));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (health: number) => {
    if (health >= 90) return 'bg-green-100';
    if (health >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const averageHealth = healthData.reduce((sum, repo) => sum + repo.health, 0) / healthData.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Repository Health
        </CardTitle>
        <CardDescription>
          Overall AGENTS.md compliance scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getHealthColor(averageHealth)}`}>
              {averageHealth.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Average Health Score</div>
          </div>

          {/* Donut Chart Visualization */}
          <div className="relative h-32 w-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              {healthData.map((repo, index) => {
                const percentage = repo.health / 100;
                const circumference = 2 * Math.PI * 56;
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference * (1 - percentage);
                const previousPercentage = healthData.slice(0, index).reduce((sum, r) => sum + r.health, 0) / 100;
                const offset = circumference * previousPercentage;
                
                return (
                  <circle
                    key={repo.name}
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={repo.health >= 90 ? '#10b981' : repo.health >= 75 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{healthData.length}</div>
                <div className="text-xs text-muted-foreground">Repos</div>
              </div>
            </div>
          </div>

          {/* Repository List */}
          <div className="space-y-2">
            {healthData.map((repo) => (
              <div key={repo.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getHealthBgColor(repo.health)}`} />
                  <span className="text-sm font-medium">{repo.name}</span>
                </div>
                <span className={`text-sm font-bold ${getHealthColor(repo.health)}`}>
                  {repo.health}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
