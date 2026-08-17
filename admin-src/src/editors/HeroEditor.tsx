import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, SaveBar, StringList, TextArea } from '../ui';
import { FileUpload } from '../FileUpload';

export function HeroEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'hero.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;
  const set = (patch: Partial<typeof data>) => update({ ...data, ...patch });

  return (
    <EditorShell title="Hero" description="The first screen — badge, name, the rotating job titles, intro and photo.">
      <div className="card grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={data.firstName} onChange={(v) => set({ firstName: v })} />
        <Field label="Last name" value={data.lastName} onChange={(v) => set({ lastName: v })} />
        <div className="sm:col-span-2">
          <Field label="Availability badge" value={data.badge} onChange={(v) => set({ badge: v })} />
        </div>
      </div>

      <div className="card space-y-4">
        <StringList
          label="Rotating job titles (typing effect)"
          items={data.roles}
          placeholder="React.js Developer"
          onChange={(roles) => set({ roles })}
        />
      </div>

      <div className="card space-y-4">
        <TextArea label="Intro paragraph" rows={4} value={data.intro} onChange={(v) => set({ intro: v })} />
        <StringList
          label="Highlighted phrases"
          items={data.introHighlights}
          placeholder="React.js"
          onChange={(introHighlights) => set({ introHighlights })}
        />
        <p className="text-[11px] text-slate-500">
          Each phrase above is tinted cyan wherever it appears in the intro. It must match the intro text exactly.
        </p>
      </div>

      <div className="card space-y-4">
        <FileUpload
          token={token}
          label="Profile photo"
          accept="image/jpeg,image/png,image/webp"
          folder="assets"
          fileName="profile.jpg"
          value={data.photo}
          onUploaded={(path) => set({ photo: path })}
          hint="Portrait orientation. Cropped to 4:5 from the top, so keep your face in the upper half."
        />
        <Field label="Photo alt text" value={data.photoAlt} onChange={(v) => set({ photoAlt: v })} />
      </div>

      <div className="card grid gap-4 sm:grid-cols-3">
        <Field label="Code card: filename" value={data.codeCard.filename} onChange={(v) => set({ codeCard: { ...data.codeCard, filename: v } })} />
        <Field label="Code card: stack" value={data.codeCard.stack} onChange={(v) => set({ codeCard: { ...data.codeCard, stack: v } })} />
        <Field label="Code card: state" value={data.codeCard.state} onChange={(v) => set({ codeCard: { ...data.codeCard, state: v } })} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 accent-cyan-500"
            checked={data.codeCard.openToWork}
            onChange={(e) => set({ codeCard: { ...data.codeCard, openToWork: e.target.checked } })}
          />
          openToWork
        </label>
      </div>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update hero via admin')} />
    </EditorShell>
  );
}
