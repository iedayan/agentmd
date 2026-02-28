import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold">Agent Execution API</h1>
        <p className="text-muted-foreground mt-2">
          REST API for discovery and execution. Webhooks for completion.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>POST /api/execute</CardTitle>
            <CardDescription>Execute an agent. Must reference AGENTS.md file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="rounded bg-muted p-4 text-sm overflow-x-auto">
              {`{
  "agentsMdUrl": "https://.../AGENTS.md",
  "agentId": "pr-labeler",
  "repositoryId": "repo_123"
}`}
            </pre>
            <p className="text-sm text-muted-foreground">
              Headers: x-api-key (required), x-webhook-url (optional)
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>GET /api/marketplace/agents</CardTitle>
            <CardDescription>Discover agents. Filters: category, certified</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded bg-muted p-4 text-sm overflow-x-auto">
              {`?category=testing&certified=true`}
            </pre>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Notifications for execution completion</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Send x-webhook-url with execute request. We POST completion payload: execution_id,
              status, duration_ms, output_summary.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rate Limits & Quotas</CardTitle>
            <CardDescription>Per API key, per plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Free: 10 executions/day</li>
              <li>Pro: 100 executions/day</li>
              <li>Enterprise: Custom</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
