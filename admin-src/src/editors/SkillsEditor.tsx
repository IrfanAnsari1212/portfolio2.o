import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, Repeater, SaveBar, Select, StringList } from '../ui';
import { ACCENTS, SKILL_ICONS, type SkillGroup } from '../types';

const blank = (): SkillGroup => ({
  id: 'group-' + Math.random().toString(36).slice(2, 7),
  title: '',
  accent: 'cyan',
  icon: 'code',
  items: [],
});

export function SkillsEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'skills.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  const set = (i: number, patch: Partial<SkillGroup>) =>
    update(data.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  const total = new Set(data.flatMap((g) => g.items).filter(Boolean)).size;

  return (
    <EditorShell
      title="Skills"
      description="Groups shown in the Skills section. These also drive the scrolling tech marquee and the “Technologies” stat."
    >
      <p className="text-xs text-slate-500">
        {data.length} groups · {total} unique technologies
      </p>

      {data.map((group, i) => (
        <Repeater
          key={group.id}
          title={group.title}
          canMoveUp={i > 0}
          canMoveDown={i < data.length - 1}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          onRemove={() => update(data.filter((_, j) => j !== i))}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Group title" value={group.title} onChange={(v) => set(i, { title: v })} />
            <Select label="Accent colour" value={group.accent} options={ACCENTS} onChange={(v) => set(i, { accent: v })} />
            <Select label="Icon" value={group.icon} options={SKILL_ICONS} onChange={(v) => set(i, { icon: v })} />
          </div>
          <StringList
            label="Technologies"
            items={group.items}
            placeholder="React.js"
            onChange={(items) => set(i, { items })}
          />
        </Repeater>
      ))}

      <button type="button" className="btn-ghost" onClick={() => update([...data, blank()])}>
        + Add skill group
      </button>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update skills via admin')} />
    </EditorShell>
  );
}
