# Portfolio Admin

React + TypeScript dashboard for editing the portfolio without touching code.

It has no database. Every save is a commit to `content/*.json` in this repo via the
GitHub Contents API; Vercel sees the commit and redeploys, so a change is live in
roughly 30–60 seconds.

```
admin-src/          this app (source)
admin/              build output — generated, gitignored, served at /admin
api/github-oauth.js serverless endpoint that swaps an OAuth code for a token
content/*.json      what the dashboard reads and writes
```

## What you can edit

| Tab | Writes to |
|---|---|
| Resume | `resume.json` + uploads `assets/Irfan-Ansari-Resume.pdf` |
| Experience | `experience.json` + uploads to `assets/experience/` |
| Projects | `projects.json` + uploads to `assets/projects/` |
| Skills | `skills.json` |
| Certifications | `certifications.json` + uploads to `assets/certificates/` |
| Hero | `hero.json` + uploads `assets/profile.jpg` |
| Contact | `contact.json` |

## One-time setup

**1. Register a GitHub OAuth App** — <https://github.com/settings/developers> → *New OAuth App*

- Homepage URL: `https://your-domain.vercel.app`
- Authorization callback URL: `https://your-domain.vercel.app/admin`

Copy the **Client ID**, then generate a **Client Secret**.

**2. Add the environment variables in Vercel** (Project → Settings → Environment Variables):

| Name | Value | Notes |
|---|---|---|
| `GITHUB_CLIENT_ID` | your client id | used by the serverless function |
| `GITHUB_CLIENT_SECRET` | your client secret | **server only — never prefix with `VITE_`** |
| `VITE_GITHUB_CLIENT_ID` | your client id | baked into the browser bundle |
| `VITE_GITHUB_REPO` | `IrfanAnsari1212/portfolio2.o` | optional, this is the default |
| `VITE_ADMIN_USER` | `IrfanAnsari1212` | optional, this is the default |

**3. Redeploy.** `VITE_*` variables are read at build time, so an existing deployment
will not pick them up until it rebuilds.

Then open `https://your-domain.vercel.app/admin`.

## Security

- The client secret stays on the server. The browser only ever holds a user token.
- The token lives in `sessionStorage`, so closing the tab signs you out.
- The `VITE_ADMIN_USER` check is a friendly error message, **not** the security
  boundary. The real protection is GitHub itself: the token can only commit if that
  account has push access to the repo. Someone else signing in gets a 403 from
  GitHub on save.
- `/admin` is served with `X-Robots-Tag: noindex` and the page carries a `noindex`
  meta tag.

## Local development

The dashboard talks to the real GitHub API, so local edits commit to the real repo.

```bash
cd admin-src
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:3000`, so run `vercel dev` from the repo
root in a second terminal if you need the OAuth exchange locally.

## Gotchas

- **Concurrent edits.** Each file is loaded with its blob SHA and saved with it. If
  the file changed on GitHub in the meantime, the save is rejected with a conflict
  message rather than silently overwriting. Hit *Reload* and reapply.
- **New accent colours.** Skill and certification accents are composed into class
  names at build time, so Tailwind cannot see them. Adding a colour to `ACCENTS` in
  `src/types.ts` also requires adding it to the `safelist` in the root
  `tailwind.config.js`, or the colour will be missing from the compiled CSS.
- **Uploads are capped at 8MB** — they are sent base64-encoded through the GitHub API.
