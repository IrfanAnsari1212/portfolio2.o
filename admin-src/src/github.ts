/**
 * Thin GitHub Contents API client.
 *
 * Every save is a commit to the portfolio repo. Vercel watches the repo, so a
 * successful write here triggers a rebuild and the change is live in ~30-60s.
 *
 * Authorisation is GitHub's, not ours: the token can only write if the signed-in
 * account actually has push access to the repo. The username check in auth.ts is
 * a UX guard, not the security boundary.
 */
import type { ContentFile, ContentMap } from './types';

const REPO = import.meta.env.VITE_GITHUB_REPO || 'IrfanAnsari1212/portfolio2.o';
const BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/* ---------- base64 helpers (chunked: spreading a big array overflows the stack) ---------- */

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function base64ToText(b64: string): string {
  const clean = b64.replace(/\s/g, '');
  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- requests ---------- */

async function request(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).message || detail;
    } catch {
      /* response had no JSON body */
    }
    throw new GitHubError(detail, res.status);
  }
  return res.json();
}

export async function getViewer(token: string): Promise<{ login: string; avatar_url: string; name: string }> {
  return request('/user', token);
}

export interface LoadedFile<T> {
  data: T;
  sha: string;
}

/** Read and parse a JSON file from /content. */
export async function loadContent<K extends ContentFile>(
  token: string,
  file: K
): Promise<LoadedFile<ContentMap[K]>> {
  const res = await request(
    `/repos/${REPO}/contents/content/${file}?ref=${BRANCH}&t=${Date.now()}`,
    token
  );
  return { data: JSON.parse(base64ToText(res.content)), sha: res.sha };
}

/**
 * Write a JSON file back. `sha` must be the one from loadContent — GitHub rejects
 * the write with 409 if the file changed in between, which is what stops two open
 * tabs from silently clobbering each other.
 */
export async function saveContent<K extends ContentFile>(
  token: string,
  file: K,
  data: ContentMap[K],
  sha: string,
  message: string
): Promise<string> {
  const body = JSON.stringify(data, null, 2) + '\n';
  const res = await request(`/repos/${REPO}/contents/content/${file}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: bytesToBase64(new TextEncoder().encode(body)),
      sha,
      branch: BRANCH,
    }),
  });
  return res.content.sha as string;
}

/**
 * Upload a binary file (resume PDF, certificate scan, project screenshot) into
 * /assets and return the repo-relative path to store in the JSON.
 */
export async function uploadAsset(
  token: string,
  file: File,
  targetPath: string,
  message: string
): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  // An existing file needs its sha to be replaced.
  let sha: string | undefined;
  try {
    const existing = await request(`/repos/${REPO}/contents/${targetPath}?ref=${BRANCH}`, token);
    sha = existing.sha;
  } catch (err) {
    if (!(err instanceof GitHubError) || err.status !== 404) throw err;
  }

  await request(`/repos/${REPO}/contents/${targetPath}`, token, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: bytesToBase64(bytes),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  return targetPath;
}

/**
 * Extension to fall back on when the uploaded file has none. A stored file with
 * no extension is served as application/octet-stream, which makes the browser
 * download it instead of opening it — so a certificate link silently stops
 * working as a preview.
 */
/** Extensions considered valid for each type the uploader accepts, canonical first. */
const MIME_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
};

/**
 * Slugify a filename so uploads never produce awkward URLs, and make sure the
 * result carries an extension.
 *
 * The browser-reported type wins over the filename, because a name alone cannot
 * be trusted: "report.v2" looks like it ends in an extension and "delta batch"
 * looks like it does not. Getting this wrong stores a file with no extension,
 * which is then served as application/octet-stream — so the link downloads the
 * file instead of previewing it.
 */
export function safeFileName(name: string, mimeType = ''): string {
  const dot = name.lastIndexOf('.');
  const nameExt = dot > 0 ? name.slice(dot).toLowerCase() : '';
  const allowed = MIME_EXTENSIONS[mimeType] || [];

  const ext = allowed.includes(nameExt)
    ? nameExt // keep the author's spelling, e.g. .jpeg over .jpg
    : allowed[0] || (/^\.[a-z0-9]{1,5}$/.test(nameExt) ? nameExt : '');

  // Strip the extension off the stem only when it is the one being re-added.
  const stem = ext && nameExt === ext ? name.slice(0, dot) : name;
  const base = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return (base || 'file') + ext;
}

export const REPO_SLUG = REPO;
