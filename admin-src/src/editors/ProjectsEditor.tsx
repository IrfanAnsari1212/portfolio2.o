import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, Repeater, SaveBar, StringList } from '../ui';
import { FileUpload } from '../FileUpload';
import type { Project } from '../types';

const blank = (): Project => ({
  id: 'project-' + Math.random().toString(36).slice(2, 7),
  title: '',
  subtitle: '',
  domain: '',
  screenshot: '',
  bullets: [],
  tags: [],
  repo: '',
  demo: '',
});

export function ProjectsEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'projects.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  const set = (i: number, patch: Partial<Project>) =>
    update(data.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  return (
    <EditorShell
      title="Projects"
      description="Project cards. The count here feeds the “Apps Shipped” stat. A screenshot makes a card far more convincing than bullets alone."
    >
      {data.map((p, i) => (
        <Repeater
          key={p.id}
          title={p.title}
          canMoveUp={i > 0}
          canMoveDown={i < data.length - 1}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          onRemove={() => update(data.filter((_, j) => j !== i))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={p.title} onChange={(v) => set(i, { title: v })} />
            <Field label="Subtitle" value={p.subtitle} onChange={(v) => set(i, { subtitle: v })} />
            <Field
              label="Domain shown in the card's browser bar"
              value={p.domain}
              onChange={(v) => set(i, { domain: v })}
              placeholder="my-app.vercel.app"
            />
            <Field label="Live demo URL" value={p.demo} onChange={(v) => set(i, { demo: v })} />
            <Field label="Repository URL" value={p.repo} onChange={(v) => set(i, { repo: v })} />
          </div>

          <FileUpload
            token={token}
            label="Screenshot"
            accept="image/png,image/jpeg,image/webp"
            folder="assets/projects"
            value={p.screenshot}
            onUploaded={(path) => set(i, { screenshot: path })}
            hint="Wide shot works best (16:10). Leave empty to show just the browser bar."
          />

          <StringList
            label="Bullets"
            items={p.bullets}
            multiline
            onChange={(bullets) => set(i, { bullets })}
          />
          <StringList label="Tech tags" items={p.tags} placeholder="React.js" onChange={(tags) => set(i, { tags })} />
        </Repeater>
      ))}

      <button type="button" className="btn-ghost" onClick={() => update([...data, blank()])}>
        + Add project
      </button>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update projects via admin')} />
    </EditorShell>
  );
}
