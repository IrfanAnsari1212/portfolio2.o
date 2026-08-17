import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, Repeater, SaveBar, Select } from '../ui';
import { FileUpload } from '../FileUpload';
import { ACCENTS, type Certification } from '../types';

const blank = (): Certification => ({
  id: 'cert-' + Math.random().toString(36).slice(2, 7),
  title: '',
  issuer: '',
  accent: 'cyan',
  file: '',
});

export function CertificationsEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'certifications.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  const set = (i: number, patch: Partial<Certification>) =>
    update(data.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  return (
    <EditorShell
      title="Certifications"
      description="Certification cards. Attaching the actual certificate turns a claim into evidence — the card then shows a “View certificate” link."
    >
      {data.map((c, i) => (
        <Repeater
          key={c.id}
          title={c.title}
          canMoveUp={i > 0}
          canMoveDown={i < data.length - 1}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          onRemove={() => update(data.filter((_, j) => j !== i))}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Title" value={c.title} onChange={(v) => set(i, { title: v })} />
            <Field label="Issuer" value={c.issuer} onChange={(v) => set(i, { issuer: v })} />
            <Select label="Accent colour" value={c.accent} options={ACCENTS} onChange={(v) => set(i, { accent: v })} />
          </div>
          <FileUpload
            token={token}
            label="Certificate file"
            accept="application/pdf,image/png,image/jpeg"
            folder="assets/certificates"
            value={c.file}
            onUploaded={(path) => set(i, { file: path })}
            hint="PDF or image. Optional."
          />
        </Repeater>
      ))}

      <button type="button" className="btn-ghost" onClick={() => update([...data, blank()])}>
        + Add certification
      </button>

      <SaveBar
        status={status}
        dirty={dirty}
        onReload={reload}
        onSave={() => void save('Update certifications via admin')}
      />
    </EditorShell>
  );
}
