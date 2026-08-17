import { useEffect, useState } from 'react';
import {
  ADMIN_USERNAME,
  beginLogin,
  completeLoginFromUrl,
  getToken,
  isConfigured,
  logout,
  verifyViewer,
  type Viewer,
} from './auth';
import { REPO_SLUG } from './github';
import { SkillsEditor } from './editors/SkillsEditor';
import { ProjectsEditor } from './editors/ProjectsEditor';
import { CertificationsEditor } from './editors/CertificationsEditor';
import { ResumeEditor } from './editors/ResumeEditor';
import { HeroEditor } from './editors/HeroEditor';
import { ContactEditor } from './editors/ContactEditor';

const TABS = [
  { id: 'resume', label: 'Resume', Component: ResumeEditor },
  { id: 'projects', label: 'Projects', Component: ProjectsEditor },
  { id: 'skills', label: 'Skills', Component: SkillsEditor },
  { id: 'certifications', label: 'Certifications', Component: CertificationsEditor },
  { id: 'hero', label: 'Hero', Component: HeroEditor },
  { id: 'contact', label: 'Contact', Component: ContactEditor },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabId>('resume');

  useEffect(() => {
    (async () => {
      try {
        const fresh = await completeLoginFromUrl();
        const existing = fresh || getToken();
        if (existing) {
          setViewer(await verifyViewer(existing));
          setToken(existing);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign-in failed.');
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return <Centered>Checking your session…</Centered>;
  }

  if (!token || !viewer) {
    return (
      <Centered>
        <div className="w-full max-w-sm space-y-5 text-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in with the GitHub account that owns <span className="font-mono text-slate-300">{REPO_SLUG}</span>.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {isConfigured() ? (
            <button className="btn-primary w-full" onClick={beginLogin}>
              Sign in with GitHub
            </button>
          ) : (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
              <strong>Not configured yet.</strong> Set <code>VITE_GITHUB_CLIENT_ID</code> at build time and
              <code> GITHUB_CLIENT_ID</code> / <code>GITHUB_CLIENT_SECRET</code> in the Vercel project, then redeploy.
              See <code>admin-src/README.md</code>.
            </p>
          )}

          <p className="text-[11px] text-slate-500">
            Only <span className="font-mono">@{ADMIN_USERNAME}</span> can edit. Every save is a commit to the repo.
          </p>
        </div>
      </Centered>
    );
  }

  const Active = TABS.find((t) => t.id === tab)!.Component;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070d1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-5 py-3">
          <span className="font-bold text-white">Portfolio Admin</span>
          <a href="/" target="_blank" rel="noopener" className="text-xs text-cyan-400 hover:text-cyan-300">
            View site ↗
          </a>
          <div className="ml-auto flex items-center gap-3">
            <img src={viewer.avatar_url} alt="" width={24} height={24} className="rounded-full" />
            <span className="text-xs text-slate-400">@{viewer.login}</span>
            <button
              className="text-xs text-slate-400 hover:text-red-300"
              onClick={() => {
                logout();
                setToken(null);
                setViewer(null);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-4xl overflow-x-auto px-5">
          <ul className="flex gap-1 pb-2">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={
                    'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ' +
                    (tab === t.id
                      ? 'bg-cyan-500/15 text-cyan-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200')
                  }
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        <Active token={token} />
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-6">{children}</div>;
}
