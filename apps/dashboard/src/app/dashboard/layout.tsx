import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">{children}</main>
    </div>
  );
}
