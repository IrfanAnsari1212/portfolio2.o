import { useContentFile, useUnsavedGuard } from '../hooks';
import { EditorShell, Field, SaveBar } from '../ui';
import { FileUpload } from '../FileUpload';

export function ResumeEditor({ token }: { token: string }) {
  const { data, status, dirty, update, save, reload } = useContentFile(token, 'resume.json');
  useUnsavedGuard(dirty);

  if (!data) return <SaveBar status={status} dirty={false} onSave={() => {}} onReload={reload} />;

  return (
    <EditorShell
      title="Resume"
      description="The Resume button in the hero links straight to this file. Uploading here replaces it everywhere."
    >
      <div className="card space-y-4">
        <FileUpload
          token={token}
          label="Resume PDF"
          accept="application/pdf"
          folder="assets"
          fileName="Irfan-Ansari-Resume.pdf"
          value={data.file}
          onUploaded={(path) =>
            update({ ...data, file: path, updated: new Date().toISOString().slice(0, 10) })
          }
          hint="Always saved as assets/Irfan-Ansari-Resume.pdf, so the link never breaks."
        />
        <Field label="Button label" value={data.label} onChange={(v) => update({ ...data, label: v })} />
        {data.updated && <p className="text-xs text-slate-500">Last uploaded: {data.updated}</p>}
      </div>

      <SaveBar status={status} dirty={dirty} onReload={reload} onSave={() => void save('Update resume via admin')} />
    </EditorShell>
  );
}
