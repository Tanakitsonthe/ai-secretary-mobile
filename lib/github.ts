const OWNER = "Tanakitsonthe";
const REPO = "AI-Secretary";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN env var not set");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export type GitHubFile = {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
};

export async function listDir(path: string): Promise<GitHubFile[]> {
  const url = `${API_BASE}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((f: { name: string; path: string; type: string; size: number; sha: string }) => ({
    name: f.name,
    path: f.path,
    type: f.type as "file" | "dir",
    size: f.size,
    sha: f.sha,
  }));
}

export async function readFile(path: string): Promise<string> {
  const url = `${API_BASE}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} reading ${path}`);
  }
  const data = await res.json();
  if (data.encoding !== "base64") {
    throw new Error(`Unexpected encoding: ${data.encoding}`);
  }
  return Buffer.from(data.content, "base64").toString("utf-8");
}

async function getFileSha(path: string): Promise<string | null> {
  const url = `${API_BASE}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
}

export async function writeFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  const sha = await getFileSha(path);
  const url = `${API_BASE}/contents/${encodeURIComponent(path)}`;
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub write ${res.status}: ${await res.text()}`);
  }
}

export async function deleteFile(
  path: string,
  message: string
): Promise<void> {
  const sha = await getFileSha(path);
  if (!sha) return;
  const url = `${API_BASE}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`GitHub delete ${res.status}: ${await res.text()}`);
  }
}

export function todayBkkDate(): string {
  const now = new Date();
  const bkkOffset = 7 * 60;
  const bkk = new Date(now.getTime() + (bkkOffset - now.getTimezoneOffset()) * 60000);
  return bkk.toISOString().slice(0, 10);
}
