import { NextRequest } from "next/server";
import { listMarketplaceAgents } from "@/lib/data/dashboard-data";
import { apiOk, getRequestId } from "@/lib/core/api-response";

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const certifiedOnly = searchParams.get("certified") === "true";
  const search = searchParams.get("q") ?? undefined;

  return apiOk(
    {
      agents: listMarketplaceAgents({
        category: category ?? undefined,
        certifiedOnly,
        search,
      }),
    },
    { requestId }
  );
}
