import { useCallback, useEffect, useState } from 'react';
import { loadContent, saveContent, GitHubError } from './github';
import type { ContentFile, ContentMap } from './types';

export type Status =
  | { kind: 'loading' }
  | { kind: 'ready' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string };

/**
 * Loads one content/*.json, tracks unsaved edits, and commits it back.
 * The sha is carried so GitHub can reject a write made against stale content.
 */
export function useContentFile<K extends ContentFile>(token: string, file: K) {
  const [data, setData] = useState<ContentMap[K] | null>(null);
  const [sha, setSha] = useState('');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  const reload = useCallback(async () => {
    setStatus({ kind: 'loading' });
    try {
      const res = await loadContent(token, file);
      setData(res.data);
      setSha(res.sha);
      setDirty(false);
      setStatus({ kind: 'ready' });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Could not load.' });
    }
  }, [token, file]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const update = useCallback((next: ContentMap[K]) => {
    setData(next);
    setDirty(true);
    setStatus({ kind: 'ready' });
  }, []);

  const save = useCallback(
    async (message: string) => {
      if (!data) return;
      setStatus({ kind: 'saving' });
      try {
        const newSha = await saveContent(token, file, data, sha, message);
        setSha(newSha);
        setDirty(false);
        setStatus({ kind: 'saved' });
      } catch (err) {
        const conflict = err instanceof GitHubError && err.status === 409;
        setStatus({
          kind: 'error',
          message: conflict
            ? 'This file changed on GitHub since you loaded it. Reload to get the latest, then reapply your edits.'
            : err instanceof Error
              ? err.message
              : 'Could not save.',
        });
      }
    },
    [token, file, data, sha]
  );

  return { data, status, dirty, update, save, reload };
}

/** Warn before closing the tab with unsaved edits. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
