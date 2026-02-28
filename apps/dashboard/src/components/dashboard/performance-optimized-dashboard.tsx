'use client';

import { Suspense, lazy, memo, useMemo, useState, useEffect } from 'react';
import { OnboardingWizard } from './onboarding-wizard';
import { DashboardStats, ActivityFeed, QuickActions } from './dashboard-widgets';

// Lazy load heavy components
const LazyRepositoryDashboard = memo(
  lazy(() =>
    import('./repository-dashboard').then((mod) => ({ default: mod.RepositoryDashboard })),
  ),
);

const LazyDataVisualization = memo(
  lazy(() =>
    import('./data-visualization').then((mod) => ({
      default: () => (
        <div className="grid gap-6 lg:grid-cols-3">
          <mod.PerformanceChart />
          <mod.ExecutionTrend />
          <mod.RepositoryHealth />
        </div>
      ),
    })),
  ),
);

// Loading components
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    ))}
  </div>
);

const ActivitySkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    ))}
  </div>
);

// Memoized header section
const DashboardHeader = memo(() => (
  <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 glass-card p-10 bg-gradient-to-br from-background via-background/90 to-primary/10 shadow-glow/5">
    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
    <div className="relative z-10">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">
        Control Center
      </p>
      <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-gradient">
        Repository Operations
      </h1>
      <p className="mt-4 max-w-2xl text-base font-medium text-muted-foreground leading-relaxed">
        Connect repositories, monitor AGENTS.md health, and trigger executions from a single,
        high-performance workflow.
      </p>
    </div>
  </div>
));

DashboardHeader.displayName = 'DashboardHeader';

// Optimized dashboard component
export function PerformanceOptimizedDashboard() {
  // Memoize the sidebar content to prevent unnecessary re-renders
  const sidebarContent = useMemo(
    () => (
      <div className="space-y-6">
        <QuickActions />
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    ),
    [],
  );

  // Memoize the main content structure
  const mainContent = useMemo(
    () => (
      <div className="space-y-8">
        <OnboardingWizard />
        <DashboardHeader />

        {/* Stats Section - Always visible, critical metrics */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats />
        </Suspense>

        {/* Data Visualization - Lazy loaded */}
        <Suspense fallback={<ChartSkeleton />}>
          <LazyDataVisualization />
        </Suspense>

        {/* Repository Dashboard - Lazy loaded */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-96 bg-muted rounded-lg animate-pulse" />}>
              <LazyRepositoryDashboard />
            </Suspense>
          </div>
          <div className="space-y-6">{sidebarContent}</div>
        </div>
      </div>
    ),
    [sidebarContent],
  );

  return mainContent;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    const startTime = performance.now();

    // Measure load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setMetrics((prev) => ({ ...prev, loadTime }));
    };

    // Measure render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics((prev) => ({ ...prev, renderTime: entry.duration }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Measure memory usage (if available)
    if ('memory' in performance) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      setMetrics((prev) => ({ ...prev, memoryUsage }));
    }

    // Trigger measurements
    setTimeout(measureLoadTime, 100);
    performance.mark('dashboard-render-start');

    return () => {
      observer.disconnect();
      performance.mark('dashboard-render-end');
      performance.measure('dashboard-render', 'dashboard-render-start', 'dashboard-render-end');
    };
  }, []);

  return metrics;
}

// Preload critical resources
export function useResourcePreloading() {
  useEffect(() => {
    // Preload critical API endpoints
    const preloadEndpoints = [
      '/api/repositories',
      '/api/executions?limit=10',
      '/api/ops/pipelines',
    ];

    preloadEndpoints.forEach((endpoint) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = endpoint;
      document.head.appendChild(link);
    });

    // Preload images and fonts
    const preloadImages = ['/icons/agentmd-icon.svg', '/images/dashboard-hero.png'];

    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
}
