import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Redirects to the GitHub App install URL using GITHUB_APP_SLUG.
 * If not configured, shows setup instructions.
 */
export default function GitHubInstallPage() {
  const slug = process.env.GITHUB_APP_SLUG?.trim();
  if (slug) {
    redirect(`https://github.com/apps/${slug}/installations/new`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">GitHub App not configured</h1>
        <p className="mt-3 text-muted-foreground">
          The AgentMD GitHub App URL is not set for this deployment. If you&apos;re self-hosting,
          configure <code className="font-mono text-sm font-medium">GITHUB_APP_SLUG</code> in your
          environment.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/setup/github-app">
            <Button>Setup GitHub App</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
