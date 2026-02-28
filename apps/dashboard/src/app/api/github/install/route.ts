/**
 * GitHub App installation redirect.
 * Redirects the user to install the AgentMD GitHub App on their repos.
 * Requires GITHUB_APP_SLUG (e.g. "agentmd" for https://github.com/apps/agentmd).
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(null, { status: 401 });
  }

  const slug = process.env.GITHUB_APP_SLUG?.trim();
  if (!slug) {
    return new Response(
      JSON.stringify({ error: 'GitHub App not configured. Set GITHUB_APP_SLUG.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const state = req.nextUrl.searchParams.get('state') ?? undefined;
  const callbackUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? 'http://localhost:3001';
  const redirectState = state || `${session.user.id}:${callbackUrl}/dashboard`;

  const installUrl = new URL(`https://github.com/apps/${slug}/installations/new`);
  installUrl.searchParams.set('state', redirectState);

  return Response.redirect(installUrl.toString(), 302);
}
