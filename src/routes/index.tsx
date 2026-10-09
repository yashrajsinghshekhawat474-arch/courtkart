import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  BookMarked,
  CircleDot,
  GitFork,
  Lock,
  Star,
} from "lucide-react";
import { getGitHubOverview } from "@/lib/github";

const overviewQuery = queryOptions({
  queryKey: ["github-overview"],
  queryFn: () => getGitHubOverview(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(overviewQuery),
  head: () => ({
    meta: [
      { title: "GitHub Overview — Repos & Open Issues" },
      {
        name: "description",
        content:
          "A live dashboard of your GitHub repositories and open issues, powered by the GitHub API connection.",
      },
      { property: "og:title", content: "GitHub Overview — Repos & Open Issues" },
      {
        property: "og:description",
        content:
          "A live dashboard of your GitHub repositories and open issues, powered by the GitHub API connection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function repoNameFromUrl(repositoryUrl: string) {
  const parts = repositoryUrl.split("/repos/")[1];
  return parts ?? repositoryUrl;
}

function Index() {
  const { data } = useSuspenseQuery(overviewQuery);
  const { user, repos, issues } = data;

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const openIssues = repos.reduce((sum, r) => sum + r.open_issues_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-10 w-10 rounded-full border border-border"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user.name ?? user.login}
              </p>
              <p className="text-xs text-muted-foreground">@{user.login}</p>
            </div>
          </div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            GitHub Overview
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<BookMarked className="h-4 w-4" />}
            label="Repositories"
            value={repos.length}
          />
          <StatCard
            icon={<Star className="h-4 w-4" />}
            label="Total stars"
            value={totalStars}
          />
          <StatCard
            icon={<CircleDot className="h-4 w-4" />}
            label="Open issues"
            value={openIssues}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Recently updated repositories
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-2">
                  {repo.private && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-primary">
                    {repo.full_name}
                  </p>
                </div>
                <p className="mt-2 line-clamp-2 min-h-10 text-xs text-muted-foreground">
                  {repo.description ?? "No description"}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <CircleDot className="h-3.5 w-3.5" />
                    {repo.open_issues_count}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Open issues assigned to you
          </h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {issues.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No open issues — nice and tidy.
              </p>
            )}
            {issues.map((issue) => (
              <a
                key={issue.id}
                href={issue.html_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent"
              >
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {issue.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {repoNameFromUrl(issue.repository_url)}
                    {issue.user ? ` · opened by ${issue.user.login}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
          <GitFork className="h-3.5 w-3.5" />
          Data loaded live from the GitHub API via your connected account.
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  );
}
