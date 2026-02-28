'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Sparkles, Sunset } from 'lucide-react';

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'theme-focus', label: 'Focus', icon: Sparkles },
  { id: 'theme-evening', label: 'Evening', icon: Sunset },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    const idx = THEMES.findIndex((t) => t.id === theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next.id);
  };

  // Render a placeholder button until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[1];
  const Icon = current.icon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${current.label}. Click to switch.`}
      title={`Theme: ${current.label}`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
