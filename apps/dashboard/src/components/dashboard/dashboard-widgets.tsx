'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  GitBranch,
  Clock,
  Users,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/core/utils';


interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const [metrics, setMetrics] = useState({
    activeRepos: { value: 12, change: 2, trend: 'up' as const },
    successRate: { value: 94.5, change: 1.2, trend: 'up' as const, unit: '%' },
    avgExecutionTime: { value: 2.3, change: -0.5, trend: 'down' as const, unit: 's' },
    activeUsers: { value: 8, change: 0, trend: 'neutral' as const },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        activeRepos: {
          ...prev.activeRepos,
          value: prev.activeRepos.value + (Math.random() > 0.8 ? 1 : 0),
        },
        successRate: {
          ...prev.successRate,
          value: Math.min(100, Math.max(85, prev.successRate.value + (Math.random() - 0.5) * 2)),
        },
        avgExecutionTime: {
          ...prev.avgExecutionTime,
          value: Math.max(1.5, prev.avgExecutionTime.value + (Math.random() - 0.5) * 0.3),
        },
        activeUsers: {
          ...prev.activeUsers,
          value: prev.activeUsers.value + (Math.random() > 0.9 ? 1 : Math.random() > 0.95 ? -1 : 0),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = [
    {
      title: 'Active Repositories',
      value: metrics.activeRepos.value,
      change: metrics.activeRepos.change,
      trend: metrics.activeRepos.trend,
      icon: <GitBranch className="h-5 w-5" />,
      description: 'Connected repositories',
    },
    {
      title: 'Success Rate',
      value: metrics.successRate.value,
      change: metrics.successRate.change,
      trend: metrics.successRate.trend,
      unit: metrics.successRate.unit,
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Pipeline success rate',
    },
    {
      title: 'Avg Execution Time',
      value: metrics.avgExecutionTime.value,
      change: metrics.avgExecutionTime.change,
      trend: metrics.avgExecutionTime.trend,
      unit: metrics.avgExecutionTime.unit,
      icon: <Clock className="h-5 w-5" />,
      description: 'Average execution duration',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.value,
      change: metrics.activeUsers.change,
      trend: metrics.activeUsers.trend,
      icon: <Users className="h-5 w-5" />,
      description: 'Team members online',
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="bento-card relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary/10 text-primary border border-primary/20 shadow-glow-sm">
                  {stat.icon}
                </div>
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-black text-gradient mt-2 tracking-tight flex items-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={stat.value}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {stat.value}
                  </motion.span>
                </AnimatePresence>
                {stat.unit && (
                  <span className="text-sm font-medium text-muted-foreground ml-1 self-end mb-1">{stat.unit}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mt-3">
                <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded-sm',
                  stat.trend === 'up' ? 'bg-green-500/10 text-green-500' :
                    stat.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400')}
                >
                  {getTrendIcon(stat.trend)}
                  {stat.trend === 'up' ? '+' : ''}{stat.change}{stat.unit}
                </span>
                <span className="text-muted-foreground/80">from last hour</span>
              </div>
            </CardContent>
            {/* Animated hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-primary/10 blur-[20px] mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>
        </motion.div>
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
      id: '1',
      type: 'success',
      title: 'Pipeline completed',
      description: 'agentmd/core pipeline completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Health score drop',
      description: 'agentmd/analytics health dropped to 72%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: 'System',
    },
    {
      id: '3',
      type: 'info',
      title: 'New repository connected',
      description: 'agentmd/ui repository was connected',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: 'Jane Smith',
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now().toString(),
        type: ['success', 'warning', 'info'][Math.floor(Math.random() * 3)] as
          | 'success'
          | 'warning'
          | 'info',
        title: 'System update',
        description: 'Background sync completed',
        timestamp: new Date(),
        user: 'System',
      };

      setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
          <Activity className="h-5 w-5 text-primary" />
          Real-time Activity
        </CardTitle>
        <CardDescription className="text-xs font-medium">Latest system events and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/30 hover:border-primary/30 transition-all duration-300"
              >
                <div className="mt-0.5 bg-background border rounded-md p-1.5 shadow-sm group-hover:shadow-glow-sm transition-shadow">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{activity.title}</p>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground ml-2 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{activity.description}</p>
                  <p className="text-[10px] font-medium text-muted-foreground/80 mt-1.5">Executed by <span className="font-bold text-foreground/80">{activity.user}</span></p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
      title: 'Run Pipeline',
      description: 'Execute agent pipeline',
      icon: <Zap className="h-4 w-4" />,
      href: '/dashboard/executions',
      variant: 'default' as const,
    },
    {
      title: 'Connect Repository',
      description: 'Add new repository',
      icon: <GitBranch className="h-4 w-4" />,
      href: '/dashboard/repositories',
      variant: 'outline' as const,
    },
    {
      title: 'View Analytics',
      description: 'Performance metrics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/dashboard/analytics',
      variant: 'outline' as const,
    },
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
