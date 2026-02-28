/**
 * GitHub App installation callback.
 * GitHub redirects here after the user installs the app.
 * Query params: installation_id, setup_action, state (userId:callbackUrl).
 */
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { upsertGitHubInstallation } from '@/lib/data/dashboard-data-facade';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const state = searchParams.get('state');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? 'http://localhost:3001';
  let redirectTo = `${baseUrl}/dashboard`;
  let userId: string | null = null;

  if (state) {
    const parts = state.split(':');
    if (parts.length >= 1 && parts[0]) {
      userId = parts[0];
    }
    if (parts.length >= 2) {
      redirectTo = parts.slice(1).join(':');
    }
  }

  if (setupAction === 'install' && installationId && userId) {
    await upsertGitHubInstallation(userId, installationId);
  }

  return NextResponse.redirect(redirectTo, 302);
}
