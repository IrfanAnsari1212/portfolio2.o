/**
 * GitHub OAuth (web flow).
 *
 * The client secret must never reach the browser, so the code->token exchange
 * happens in /api/github-oauth. The resulting token lives in sessionStorage, so
 * closing the tab logs you out.
 */
import { getViewer } from './github';

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'IrfanAnsari1212';
const TOKEN_KEY = 'portfolio_admin_token';
const STATE_KEY = 'portfolio_admin_oauth_state';

export const isConfigured = () => Boolean(CLIENT_ID);

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(STATE_KEY);
}

export function beginLogin() {
  // Random state, echoed back by GitHub, so a response from another origin cannot
  // be replayed into this session.
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  // Vercel serves both /admin and /admin/, but only one exact callback URL is
  // registered on the OAuth app. Drop any trailing slash so both entry points
  // produce the identical redirect_uri.
  const redirectUri = window.location.origin + window.location.pathname.replace(/\/+$/, '');
  const url =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&scope=repo' +
    `&state=${encodeURIComponent(state)}`;
  window.location.href = url;
}

export interface Viewer {
  login: string;
  name: string;
  avatar_url: string;
}

/**
 * If we came back from GitHub with ?code=, swap it for a token.
 * Returns the token, or null when there is nothing to complete.
 */
export async function completeLoginFromUrl(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  if (!code) return null;

  const expected = sessionStorage.getItem(STATE_KEY);
  // Clear the query string either way so a refresh cannot replay the code.
  window.history.replaceState({}, '', window.location.pathname);
  sessionStorage.removeItem(STATE_KEY);

  if (!expected || returnedState !== expected) {
    throw new Error('Login state mismatch — please try signing in again.');
  }

  const res = await fetch('/api/github-oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error(body.error || 'Could not complete GitHub sign-in.');
  }

  sessionStorage.setItem(TOKEN_KEY, body.access_token);
  return body.access_token as string;
}

/**
 * Confirm the token belongs to the owner. GitHub still enforces write access on
 * every commit, so this only exists to fail fast with a clear message.
 */
export async function verifyViewer(token: string): Promise<Viewer> {
  const viewer = await getViewer(token);
  if (viewer.login.toLowerCase() !== ADMIN_USER.toLowerCase()) {
    logout();
    throw new Error(`Signed in as @${viewer.login}, which is not the owner of this site.`);
  }
  return viewer;
}

export const ADMIN_USERNAME = ADMIN_USER;
