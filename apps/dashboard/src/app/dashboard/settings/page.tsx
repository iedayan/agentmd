import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getPlan } from "@/lib/billing/plans";
import { SettingsProfile } from "@/components/settings/settings-profile";
import { SettingsApiKeys } from "@/components/settings/settings-api-keys";
import { SettingsNotifications } from "@/components/settings/settings-notifications";
import { SettingsDangerZone } from "@/components/settings/settings-danger-zone";
import { SettingsUsage } from "@/components/settings/settings-usage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await getSession();
  const freePlan = getPlan("free");
  const proPlan = getPlan("pro");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <SettingsProfile
          name={session?.user?.name ?? ""}
          email={session?.user?.email ?? ""}
          image={session?.user?.image ?? null}
        />

        {/* Current Plan / Usage */}
        <SettingsUsage
          planId="free"
          repositoryLimit={freePlan.repositories}
          executionMinutesLimit={freePlan.executionMinutes}
          logRetentionDays={freePlan.logRetentionDays}
        />

        {/* Upgrade to Pro */}
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>
              ${proPlan.price}/month — Unlimited repos, 1000 min, team features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Unlimited repositories</li>
              <li>1000 execution minutes/month</li>
              <li>Parallel test execution</li>
              <li>5 team seats</li>
              <li>Slack/Discord notifications</li>
              <li>30-day log retention</li>
              <li>Priority email support</li>
            </ul>
            <Link href="/dashboard/settings/billing">
              <Button className="w-full">Upgrade with Stripe</Button>
            </Link>
          </CardContent>
        </Card>

        {/* API Keys */}
        <SettingsApiKeys />

        {/* Notifications */}
        <SettingsNotifications />

        {/* Danger Zone */}
        <SettingsDangerZone />
      </div>
    </div>
  );
}
