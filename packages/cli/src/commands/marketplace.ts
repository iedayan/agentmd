#!/usr/bin/env node
/**
 * AgentMD Marketplace CLI
 * List and execute agents from the marketplace
 */

export async function listAgents(options: { category?: string; certified?: boolean }) {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.certified) params.set("certified", "true");

  const res = await fetch(
    `https://api.agentmd.online/marketplace/agents?${params}`,
    { headers: { "User-Agent": "agentmd-cli/0.1" } }
  );
  const data = await res.json();
  return data.agents ?? [];
}

export async function executeAgent(
  agentId: string,
  repositoryId: string,
  apiKey: string
) {
  const res = await fetch("https://api.agentmd.online/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ agentId, repositoryId }),
  });
  return res.json();
}
