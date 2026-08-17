import type { ReactNode } from 'react';
import type { Status } from './hooks';

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="field"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field resize-y" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Editable list of plain strings — skill pills, bullets, tags, typing roles. */
export function StringList({
  label,
  items,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea className="field resize-y" rows={2} value={item} onChange={(e) => set(i, e.target.value)} />
            ) : (
              <input className="field" value={item} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
            )}
            <div className="flex shrink-0 gap-1 pt-0.5">
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconBtn>
              <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</IconBtn>
              <IconBtn label="Remove" onClick={() => remove(i)} danger>×</IconBtn>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-500">Nothing yet.</p>}
      </div>
      <button type="button" className="btn-ghost mt-2 !py-1.5 !text-xs" onClick={() => onChange([...items, ''])}>
        + Add
      </button>
    </div>
  );
}

export function IconBtn({
  children,
  onClick,
  label,
  disabled,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={
        'h-8 w-8 rounded-md border text-sm transition disabled:opacity-30 ' +
        (danger
          ? 'border-red-500/40 text-red-300 hover:bg-red-500/10'
          : 'border-slate-700 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300')
      }
    >
      {children}
    </button>
  );
}

/** Sticky save bar shown at the bottom of every editor. */
export function SaveBar({
  status,
  dirty,
  onSave,
  onReload,
}: {
  status: Status;
  dirty: boolean;
  onSave: () => void;
  onReload: () => void;
}) {
  const busy = status.kind === 'saving' || status.kind === 'loading';
  return (
    <div className="sticky bottom-0 -mx-1 mt-8 flex flex-wrap items-center gap-3 border-t border-slate-800 bg-[#070d1a]/95 px-1 py-4 backdrop-blur">
      <button className="btn-primary" onClick={onSave} disabled={busy || !dirty}>
        {status.kind === 'saving' ? 'Committing…' : 'Save & publish'}
      </button>
      <button className="btn-ghost" onClick={onReload} disabled={busy}>
        Reload
      </button>
      <StatusText status={status} dirty={dirty} />
    </div>
  );
}

function StatusText({ status, dirty }: { status: Status; dirty: boolean }) {
  if (status.kind === 'error')
    return <span role="alert" className="text-xs text-red-400">{status.message}</span>;
  if (status.kind === 'saved')
    return (
      <span role="status" className="text-xs text-emerald-400">
        Committed. Vercel will redeploy in ~30–60s.
      </span>
    );
  if (status.kind === 'loading') return <span className="text-xs text-slate-500">Loading…</span>;
  if (dirty) return <span className="text-xs text-amber-400">Unsaved changes</span>;
  return <span className="text-xs text-slate-500">Up to date</span>;
}

export function Repeater({
  title,
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  title: string;
  children: ReactNode;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{title || 'Untitled'}</h3>
        <div className="flex shrink-0 gap-1">
          <IconBtn label="Move up" onClick={onMoveUp} disabled={!canMoveUp}>↑</IconBtn>
          <IconBtn label="Move down" onClick={onMoveDown} disabled={!canMoveDown}>↓</IconBtn>
          <IconBtn label="Remove" onClick={onRemove} danger>×</IconBtn>
        </div>
      </div>
      {children}
    </div>
  );
}

export function EditorShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}
