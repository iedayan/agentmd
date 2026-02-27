"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DeployPage() {
  const handleDownloadCompose = () => {
    window.open("/api/deploy/compose", "_blank");
  };

  return (
    <div className="p-8 max-w-2xl bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Self-Hosted Deployment</h1>
        <p className="text-muted-foreground">
          Docker, Kubernetes, air-gapped support
        </p>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Docker Compose</CardTitle>
            <CardDescription>
              Single-command deploy with PostgreSQL + Redis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded bg-muted p-4 text-sm overflow-x-auto">
{`docker compose -f deploy/docker-compose.yml up -d`}
            </pre>
            <Button variant="outline" className="mt-4" onClick={handleDownloadCompose}>
              Download compose file
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes / Helm</CardTitle>
            <CardDescription>
              Scale with Helm charts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded bg-muted p-4 text-sm overflow-x-auto">
{`helm install agentmd agentmd/agentmd -f values.yaml`}
            </pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>License Key</CardTitle>
            <CardDescription>
              Set AGENTMD_LICENSE_KEY for Enterprise activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact sales@agentmd.online for air-gapped license.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
