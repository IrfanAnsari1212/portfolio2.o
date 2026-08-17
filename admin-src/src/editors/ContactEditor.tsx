import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, SaveBar } from '../ui';

export function ContactEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'contact.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;
  const set = (patch: Partial<typeof data>) => update({ ...data, ...patch });

  return (
    <EditorShell
      title="Contact"
      description="Used by the contact cards, the hero social icons, the mailto fallback and the structured-data block Google reads."
    >
      <div className="card grid gap-4 sm:grid-cols-2">
        <Field label="Email" type="email" value={data.email} onChange={(v) => set({ email: v })} />
        <Field label="Phone (displayed)" value={data.phone} onChange={(v) => set({ phone: v })} />
        <Field
          label="Phone link"
          value={data.phoneHref}
          onChange={(v) => set({ phoneHref: v })}
          hint="Must start with tel: and contain no spaces."
        />
        <Field label="Location" value={data.location} onChange={(v) => set({ location: v })} />
        <Field label="Availability status" value={data.status} onChange={(v) => set({ status: v })} />
      </div>

      <div className="card grid gap-4 sm:grid-cols-2">
        <Field label="LinkedIn URL" value={data.linkedin.url} onChange={(v) => set({ linkedin: { ...data.linkedin, url: v } })} />
        <Field label="LinkedIn label" value={data.linkedin.label} onChange={(v) => set({ linkedin: { ...data.linkedin, label: v } })} />
        <Field label="GitHub URL" value={data.github.url} onChange={(v) => set({ github: { ...data.github, url: v } })} />
        <Field label="GitHub label" value={data.github.label} onChange={(v) => set({ github: { ...data.github, label: v } })} />
      </div>

      <div className="card">
        <Field
          label="Contact form endpoint"
          value={data.formEndpoint}
          onChange={(v) => set({ formEndpoint: v })}
          placeholder="https://formspree.io/f/xxxxxxx"
          hint="Leave empty and the form opens the visitor's mail client instead. Paste a Formspree or Web3Forms URL for real inbox delivery."
        />
      </div>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update contact details via admin')} />
    </EditorShell>
  );
}
