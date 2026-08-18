import { useState } from 'react';
import { uploadAsset, safeFileName } from './github';

/**
 * Commits a file into /assets and hands the repo-relative path back.
 * The path is what gets stored in content/*.json.
 */
export function FileUpload({
  token,
  label,
  value,
  accept,
  folder,
  fileName,
  onUploaded,
  hint,
}: {
  token: string;
  label: string;
  value: string;
  accept: string;
  folder: string;
  /** Fixed name (e.g. the resume) — otherwise the uploaded file's name is slugified. */
  fileName?: string;
  onUploaded: (path: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle(file: File | undefined) {
    if (!file) return;
    setError('');

    const MAX = 8 * 1024 * 1024;
    if (file.size > MAX) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Keep uploads under 8MB.`);
      return;
    }

    setBusy(true);
    try {
      const name = fileName || safeFileName(file.name, file.type);
      const path = `${folder}/${name}`;
      await uploadAsset(token, file, path, `Upload ${name} via admin`);
      // Cache-bust so a replaced file of the same name shows the new version.
      onUploaded(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-ghost cursor-pointer !py-1.5 !text-xs">
          {busy ? 'Uploading…' : value ? 'Replace file' : 'Choose file'}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void handle(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        {value ? (
          <a
            href={`/${value}`}
            target="_blank"
            rel="noopener"
            className="text-xs text-cyan-400 hover:text-cyan-300 break-all"
          >
            {value}
          </a>
        ) : (
          <span className="text-xs text-slate-500">No file yet</span>
        )}
        {value && (
          <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => onUploaded('')}>
            Unlink
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
