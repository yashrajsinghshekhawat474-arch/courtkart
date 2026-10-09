import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  updated_at: string;
  private: boolean;
}

export interface GitHubIssue {
  id: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  repository_url: string;
  user: { login: string } | null;
}

async function githubFetch<T>(path: string): Promise<T> {
  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }
  const GITHUB_API_KEY = process.env["GITHUB_API_KEY"];
  if (!GITHUB_API_KEY) {
    throw new Error("GITHUB_API_KEY is not configured");
  }

  const response = await fetch(`${GATEWAY_URL}/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GITHUB_API_KEY,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`GitHub request failed [${response.status}]: ${errorBody}`);
    throw new Error(`GitHub request failed [${response.status}]: ${errorBody}`);
  }
  return response.json() as Promise<T>;
}

export const getGitHubOverview = createServerFn({ method: "GET" }).handler(
  async () => {
    const [user, repos, issues] = await Promise.all([
      githubFetch<{ login: string; name: string | null; avatar_url: string }>(
        "user",
      ),
      githubFetch<GitHubRepo[]>(
        "user/repos?sort=updated&per_page=12&type=all",
      ),
      githubFetch<GitHubIssue[]>(
        "issues?state=open&per_page=15&sort=updated",
      ),
    ]);
    return { user, repos, issues };
  },
);
