import Link from 'next/link';
import { GithubAppSetupWizard } from '@/components/setup/github-app-setup-wizard';
import { BackLink } from '@/components/ui/back-link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'GitHub App Setup | AgentMD',
  description: 'Guided setup for GitHub OAuth App and GitHub App. Get your URLs and env vars.',
};

export default function GitHubAppSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-3xl py-12 px-4">
        <div className="mb-8">
          <BackLink href="/docs/quickstart">Back to Quick Start</BackLink>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">GitHub App Setup</h1>
          <p className="text-muted-foreground mt-2">
            Generate the exact URLs and configuration you need for GitHub OAuth and GitHub App.
            Paste these values into GitHub Developer Settings.
          </p>
        </div>

        <GithubAppSetupWizard />

        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Manual setup</CardTitle>
            <CardDescription>
              Prefer step-by-step instructions? See{' '}
              <Link
                href="https://github.com/iedayan/agentmd/blob/main/deploy/provision/GITHUB.md"
                className="underline"
              >
                deploy/provision/GITHUB.md
              </Link>{' '}
              in the repo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
