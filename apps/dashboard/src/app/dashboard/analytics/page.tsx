import dynamic from 'next/dynamic';

const AnalyticsDashboard = dynamic(
  () =>
    import('@/components/dashboard/analytics-dashboard').then((m) => ({
      default: m.AnalyticsDashboard,
    })),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  },
);

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Custom dashboards, usage forecasting, ROI calculator
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
