"use client";

import { useState, useEffect } from "react";
import { EnhancedDashboardHeader } from "./enhanced-dashboard-header";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { cn } from "@/lib/core/utils";

interface DashboardWidget {
  id: string;
  title: string;
  type: "stats" | "chart" | "activity" | "list";
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
  content: React.ReactNode;
}

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  widgets?: DashboardWidget[];
  onWidgetUpdate?: (widgets: DashboardWidget[]) => void;
}

export function EnhancedDashboardLayout({ 
  children, 
  widgets = [], 
  onWidgetUpdate 
}: EnhancedDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedDashboardHeader />
      <div className="flex">
        <EnhancedSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64",
          "pt-0" // No padding top since header is fixed
        )}>
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
