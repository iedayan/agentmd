import { EnhancedDashboardLayout } from '@/components/dashboard/enhanced-dashboard-layout';
import { RepositoryDashboard } from '@/components/dashboard/repository-dashboard';
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard';
import {
  DashboardStats,
  ActivityFeed,
  QuickActions,
} from '@/components/dashboard/dashboard-widgets';
import {
  PerformanceChart,
  ExecutionTrend,
  RepositoryHealth,
} from '@/components/dashboard/data-visualization';

export default function DashboardPage() {
  return (
    <EnhancedDashboardLayout>
      <div className="space-y-8">
        <OnboardingWizard />

        {/* Enhanced Header Section */}
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

        {/* Enhanced Dashboard Widgets */}
        <div className="space-y-6">
          <DashboardStats />

          {/* Data Visualization Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <PerformanceChart />
            <ExecutionTrend />
            <RepositoryHealth />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RepositoryDashboard />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </EnhancedDashboardLayout>
  );
}
