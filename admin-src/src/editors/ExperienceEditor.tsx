import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, IconBtn, Repeater, SaveBar, StringList, TextArea } from '../ui';
import { FileUpload } from '../FileUpload';
import type { Experience, ExperienceProject } from '../types';

const rid = (p: string) => p + '-' + Math.random().toString(36).slice(2, 7);

const blankRole = (): Experience => ({
  id: rid('role'),
  company: '',
  role: '',
  type: 'Internship',
  location: '',
  start: '',
  end: '',
  summary: '',
  projects: [],
});

const blankProject = (): ExperienceProject => ({
  id: rid('work'),
  name: '',
  description: '',
  bullets: [],
  tech: [],
  link: '',
  screenshot: '',
});

export function ExperienceEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'experience.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  const setRole = (i: number, patch: Partial<Experience>) =>
    update(data.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const moveRole = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= data.length) return;
    const next = [...data];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  const setProject = (ri: number, pi: number, patch: Partial<ExperienceProject>) =>
    setRole(ri, { projects: data[ri].projects.map((p, j) => (j === pi ? { ...p, ...patch } : p)) });

  const moveProject = (ri: number, pi: number, dir: -1 | 1) => {
    const list = data[ri].projects;
    const j = pi + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[pi], next[j]] = [next[j], next[pi]];
    setRole(ri, { projects: next });
  };

  return (
    <EditorShell
      title="Experience"
      description="Real roles at real organisations. This section sits above Projects, and disappears entirely while it is empty — so an unfinished Experience heading never ships."
    >
      {data.length === 0 && (
        <p className="card text-sm text-slate-400">
          Nothing here yet, so the Experience section and its nav link are left out of the page
          completely. Add a role below to switch it on.
        </p>
      )}

      {data.map((role, ri) => (
        <Repeater
          key={role.id}
          title={role.company || 'New role'}
          canMoveUp={ri > 0}
          canMoveDown={ri < data.length - 1}
          onMoveUp={() => moveRole(ri, -1)}
          onMoveDown={() => moveRole(ri, 1)}
          onRemove={() => update(data.filter((_, j) => j !== ri))}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Company"
              value={role.company}
              onChange={(v) => setRole(ri, { company: v })}
              hint="Use “Confidential client” if you cannot name them."
            />
            <Field
              label="Role title"
              value={role.role}
              onChange={(v) => setRole(ri, { role: v })}
              hint="Use the exact title from your offer letter."
            />
            <Field label="Type" value={role.type} onChange={(v) => setRole(ri, { type: v })} />
            <Field
              label="Location"
              value={role.location}
              onChange={(v) => setRole(ri, { location: v })}
              placeholder="Remote"
            />
            <Field label="Start" value={role.start} onChange={(v) => setRole(ri, { start: v })} placeholder="Jan 2026" />
            <Field
              label="End"
              value={role.end}
              onChange={(v) => setRole(ri, { end: v })}
              placeholder="Leave empty if current"
              hint="Empty shows “Present” with a live dot."
            />
          </div>

          <TextArea
            label="Summary (optional)"
            rows={2}
            value={role.summary}
            onChange={(v) => setRole(ri, { summary: v })}
          />

          <div className="border-t border-slate-800 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="label !mb-0">Projects worked on</span>
              <button
                type="button"
                className="btn-ghost !py-1.5 !text-xs"
                onClick={() => setRole(ri, { projects: [...role.projects, blankProject()] })}
              >
                + Add project
              </button>
            </div>

            {role.projects.length === 0 && (
              <p className="text-xs text-slate-500">No projects listed for this role yet.</p>
            )}

            <div className="space-y-4">
              {role.projects.map((p, pi) => (
                <div key={p.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-200">{p.name || 'Untitled project'}</span>
                    <div className="flex shrink-0 gap-1">
                      <IconBtn label="Move up" onClick={() => moveProject(ri, pi, -1)} disabled={pi === 0}>↑</IconBtn>
                      <IconBtn
                        label="Move down"
                        onClick={() => moveProject(ri, pi, 1)}
                        disabled={pi === role.projects.length - 1}
                      >↓</IconBtn>
                      <IconBtn
                        label="Remove project"
                        danger
                        onClick={() => setRole(ri, { projects: role.projects.filter((_, j) => j !== pi) })}
                      >×</IconBtn>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Project name" value={p.name} onChange={(v) => setProject(ri, pi, { name: v })} />
                    <Field
                      label="One-line description"
                      value={p.description}
                      onChange={(v) => setProject(ri, pi, { description: v })}
                      placeholder="Internal operations dashboard"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Live link (optional)"
                        value={p.link}
                        onChange={(v) => setProject(ri, pi, { link: v })}
                        hint="Only link what is publicly accessible and you have permission to show."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <StringList
                      label="What you did"
                      items={p.bullets}
                      multiline
                      onChange={(bullets) => setProject(ri, pi, { bullets })}
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Describe your contribution, not the whole product. “Rebuilt the order-tracking
                      screen, cutting load time from 4s to 1.2s” beats “Built the platform”.
                    </p>
                  </div>

                  <div className="mt-4">
                    <StringList
                      label="Tech used"
                      items={p.tech}
                      placeholder="React.js"
                      onChange={(tech) => setProject(ri, pi, { tech })}
                    />
                  </div>

                  <div className="mt-4">
                    <FileUpload
                      token={token}
                      label="Screenshot (optional)"
                      accept="image/png,image/jpeg,image/webp"
                      folder="assets/experience"
                      value={p.screenshot}
                      onUploaded={(path) => setProject(ri, pi, { screenshot: path })}
                      hint="Public pages only. Never post admin panels or screens showing real customer data."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Repeater>
      ))}

      <button type="button" className="btn-ghost" onClick={() => update([...data, blankRole()])}>
        + Add role
      </button>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update experience via admin')} />
    </EditorShell>
  );
}
