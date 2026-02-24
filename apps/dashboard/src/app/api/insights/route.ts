import { NextRequest } from "next/server";
import { apiOk, getRequestId } from "@/lib/core/api-response";
import { listRepositories } from "@/lib/data/dashboard-data-facade";
import { buildInsights } from "@/lib/analytics/insights";
import { getPlan } from "@/lib/billing/plans";
import { requireSessionUserId } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch (res) {
    return res as Response;
  }
  const repositories = await listRepositories(userId);
  const repositoryLimit = getPlan("free").repositories;
  const insights = buildInsights(
    repositories,
    typeof repositoryLimit === "number" ? repositoryLimit : "unlimited"
  );

  return apiOk(
    {
      insights,
      meta: {
        generatedAt: new Date().toISOString(),
        repositoryCount: repositories.length,
      },
    },
    { requestId }
  );
}
