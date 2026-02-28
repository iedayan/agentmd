'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/core/utils';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
}

interface EnhancedSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: 'Main dashboard overview',
  },
  {
    title: 'Repositories',
    href: '/dashboard/repositories',
    icon: <GitBranch className="h-4 w-4" />,
    badge: '12',
    description: 'Manage connected repositories',
  },
  {
    title: 'Executions',
    href: '/dashboard/executions',
    icon: <Zap className="h-4 w-4" />,
    badge: '3',
    description: 'View pipeline executions',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Performance analytics',
  },
  {
    title: 'Policies',
    href: '/dashboard/policies',
    icon: <Shield className="h-4 w-4" />,
    description: 'Governance policies',
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: <Users className="h-4 w-4" />,
    description: 'Team management',
  },
  {
    title: 'Documentation',
    href: '/docs',
    icon: <FileText className="h-4 w-4" />,
    description: 'View documentation',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
    description: 'Account settings',
  },
];

export function EnhancedSidebar({ collapsed = false, onToggle }: EnhancedSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = navigationItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">AgentMD</span>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
            <Zap className="h-4 w-4" />
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;

            const NavItem = () => (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2',
                )}
              >
                {item.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavItem />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return <NavItem key={item.href} />;
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border/40 p-2">
        {!collapsed ? (
          <div className="space-y-2">
            <Link href="/help">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </Button>
            </Link>
            <div className="rounded-lg bg-muted p-3">
              <div className="text-xs font-medium text-muted-foreground">Plan</div>
              <div className="text-sm font-bold">Pro Plan</div>
              <div className="text-xs text-muted-foreground mt-1">12 of 15 repositories used</div>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-center p-2">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Help & Support</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border/40 bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <SidebarContent />
    </div>
  );
}
