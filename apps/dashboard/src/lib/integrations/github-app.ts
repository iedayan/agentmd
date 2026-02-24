/**
 * GitHub App authentication and API helpers.
 * Requires GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.
 */
import { SignJWT, importPKCS8 } from "jose";

async function getGitHubAppJwt(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!appId || !privateKey) {
    throw new Error("GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY required");
  }

  const pem = privateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 600)
    .setIssuer(appId)
    .sign(key);

  return jwt;
}

async function getInstallationToken(installationId: string): Promise<string> {
  const jwt = await getGitHubAppJwt();
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  private: boolean;
}

export async function listInstallationRepositories(installationId: string): Promise<GitHubRepo[]> {
  const token = await getInstallationToken(installationId);
  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `https://api.github.com/installation/repositories?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub API: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { repositories?: Array<{ id: number; full_name: string; name: string; owner: { login: string }; private: boolean }> };
    const batch = data.repositories ?? [];
    repos.push(...batch.map((r) => ({ id: r.id, full_name: r.full_name, name: r.name, owner: r.owner, private: r.private })));
    hasMore = batch.length === 100;
    page++;
  }

  return repos;
}
