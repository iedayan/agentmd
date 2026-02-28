'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SettingsProfile({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(name);
  const [displayEmail, setDisplayEmail] = useState(email);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, email: displayEmail }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? 'Failed to save');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account information. Managed via GitHub OAuth.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
            {image ? (
              <Image
                src={image}
                alt="Profile avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold text-muted-foreground">
                {displayName?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">
              Avatar is synced from your GitHub account.
            </p>
          </div>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium block mb-2">
            Name
          </label>
          <Input
            id="profile-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="text-sm font-medium block mb-2">
            Email
          </label>
          <Input
            id="profile-email"
            type="email"
            value={displayEmail}
            onChange={(e) => setDisplayEmail(e.target.value)}
            placeholder="you@example.com"
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-xs text-muted-foreground mt-1">
            Primary email from GitHub. Contact support to change.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
