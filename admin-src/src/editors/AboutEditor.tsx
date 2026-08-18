import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, IconBtn, SaveBar, Select } from '../ui';
import { STAT_SOURCES, type AboutStat, type StatSource } from '../types';

const SOURCE_HELP: Record<StatSource, string> = {
  projects: 'Counts the entries in Projects',
  certifications: 'Counts the entries in Certifications',
  technologies: 'Counts unique technologies across Skills, with a “+”',
  experience: 'Counts the roles in Experience',
  custom: 'Shows whatever you type below',
};

export function AboutEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'about.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  const setPara = (i: number, v: string) =>
    update({ ...data, paragraphs: data.paragraphs.map((p, j) => (j === i ? v : p)) });

  const movePara = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.paragraphs.length) return;
    const next = [...data.paragraphs];
    [next[i], next[j]] = [next[j], next[i]];
    update({ ...data, paragraphs: next });
  };

  const setStat = (i: number, patch: Partial<AboutStat>) =>
    update({ ...data, stats: data.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  const moveStat = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.stats.length) return;
    const next = [...data.stats];
    [next[i], next[j]] = [next[j], next[i]];
    update({ ...data, stats: next });
  };

  return (
    <EditorShell title="About" description="The “Who I Am” section — heading, paragraphs and the four stat tiles.">
      <div className="card">
        <Field label="Section heading" value={data.heading} onChange={(v) => update({ ...data, heading: v })} />
      </div>

      <div className="card space-y-3">
        <span className="label !mb-0">Paragraphs</span>
        <p className="text-[11px] text-slate-500">
          Wrap text in <code className="text-slate-300">**double asterisks**</code> to emphasise it in
          white, or in <code className="text-slate-300">`backticks`</code> to tint it cyan for a
          technology name. Everything else is plain text.
        </p>

        {data.paragraphs.map((p, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea className="field resize-y" rows={4} value={p} onChange={(e) => setPara(i, e.target.value)} />
            <div className="flex shrink-0 flex-col gap-1 pt-0.5">
              <IconBtn label="Move up" onClick={() => movePara(i, -1)} disabled={i === 0}>↑</IconBtn>
              <IconBtn label="Move down" onClick={() => movePara(i, 1)} disabled={i === data.paragraphs.length - 1}>↓</IconBtn>
              <IconBtn
                label="Remove paragraph"
                danger
                onClick={() => update({ ...data, paragraphs: data.paragraphs.filter((_, j) => j !== i) })}
              >×</IconBtn>
            </div>
          </div>
        ))}
        {data.paragraphs.length === 0 && <p className="text-xs text-slate-500">No paragraphs yet.</p>}

        <button
          type="button"
          className="btn-ghost !py-1.5 !text-xs"
          onClick={() => update({ ...data, paragraphs: [...data.paragraphs, ''] })}
        >
          + Add paragraph
        </button>
      </div>

      <div className="card space-y-4">
        <div>
          <span className="label !mb-0">Stat tiles</span>
          <p className="mt-1 text-[11px] text-slate-500">
            Most tiles count themselves from your other content, so they cannot go stale. Pick
            “custom” only for a number nothing else tracks.
          </p>
        </div>

        {data.stats.map((s, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-200">{s.label || 'Untitled tile'}</span>
              <div className="flex shrink-0 gap-1">
                <IconBtn label="Move up" onClick={() => moveStat(i, -1)} disabled={i === 0}>↑</IconBtn>
                <IconBtn label="Move down" onClick={() => moveStat(i, 1)} disabled={i === data.stats.length - 1}>↓</IconBtn>
                <IconBtn
                  label="Remove tile"
                  danger
                  onClick={() => update({ ...data, stats: data.stats.filter((_, j) => j !== i) })}
                >×</IconBtn>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Label" value={s.label} onChange={(v) => setStat(i, { label: v })} />
              <Select
                label="Value from"
                value={s.source}
                options={STAT_SOURCES}
                onChange={(v) => setStat(i, { source: v })}
              />
              {s.source === 'custom' ? (
                <Field label="Value" value={s.value} onChange={(v) => setStat(i, { value: v })} />
              ) : (
                <div>
                  <span className="label">Value</span>
                  <p className="pt-2 text-xs text-slate-500">{SOURCE_HELP[s.source]}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn-ghost !py-1.5 !text-xs"
          onClick={() => update({ ...data, stats: [...data.stats, { label: '', source: 'custom', value: '' }] })}
        >
          + Add tile
        </button>

        <p className="text-[11px] text-slate-500">
          The Quick Facts card next to these tiles is not editable here — it reads your name, role,
          location and availability from the Hero and Contact tabs, so it cannot drift out of sync
          with them.
        </p>
      </div>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update about via admin')} />
    </EditorShell>
  );
}
