/**
 * Renders src/index.template.html into index.html using the JSON in content/.
 *
 * Placeholders:
 *   {{a.b.c}}    value, HTML-escaped
 *   {{{a.b.c}}}  value, inserted raw (used for the generated blocks below)
 *
 * The admin dashboard commits changes to content/*.json; Vercel then re-runs
 * this build, so the deployed HTML is always fully static.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));

const site = read('site.json');
const hero = read('hero.json');
const contact = read('contact.json');
const skills = read('skills.json');
const projects = read('projects.json');
const certifications = read('certifications.json');
const resume = read('resume.json');

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Reveal stagger used by the original markup: first card no delay, then .1/.15/.2s */
const DELAYS = [null, '.1s', '.15s', '.2s'];
const delayAttr = (i) => (DELAYS[i] ? ` style="transition-delay:${DELAYS[i]}"` : DELAYS[i] === null && i === 0 ? '' : ' style="transition-delay:.2s"');

const ICONS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
};
const GITHUB_PATH = 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z';

/* ---------- blocks ---------- */

function introBlock() {
  // Wrap each configured highlight in the accent span, matching the original markup.
  let html = esc(hero.intro);
  for (const term of hero.introHighlights || []) {
    html = html.replace(esc(term), `<span class="text-cyan-300 font-medium">${esc(term)}</span>`);
  }
  return html;
}

function codeCardBlock() {
  const c = hero.codeCard;
  return (
    '<code><span class="text-violet-400">const</span> <span class="text-cyan-300">dev</span> = {\n' +
    `  stack: <span class="text-emerald-300">"${esc(c.stack)}"</span>,\n` +
    `  state: <span class="text-emerald-300">"${esc(c.state)}"</span>,\n` +
    `  openToWork: <span class="text-violet-400">${c.openToWork}</span>,\n` +
    '};</code>'
  );
}

function marqueeBlock() {
  const items = [...new Set(skills.flatMap((g) => g.items))];
  const run = items
    .map((i) => `<span>${esc(i)}</span><span class="text-cyan-400">✦</span>`)
    .join('');
  return (
    `    <div class="flex gap-10 items-center">${run}</div>\n` +
    `    <div class="flex gap-10 items-center" aria-hidden="true">${run}</div>`
  );
}

function statsBlock() {
  const techCount = new Set(skills.flatMap((g) => g.items)).size;
  const tiles = [
    [projects.length, 'Apps Shipped'],
    [certifications.length, 'Certifications'],
    [techCount + '+', 'Technologies'],
    [site.gradYear, 'Grad Year'],
  ];
  return tiles
    .map(
      ([v, label]) =>
        `        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">\n` +
        `          <p class="font-display text-2xl font-bold gradient-text">${esc(v)}</p>\n` +
        `          <p class="text-xs text-slate-400 mt-1">${esc(label)}</p>\n` +
        `        </div>`
    )
    .join('\n');
}

function skillsBlock() {
  return skills
    .map((group, i) => {
      const a = group.accent;
      const pills = group.items
        .map(
          (item) =>
            `        <span class="px-4 py-1.5 rounded-full bg-slate-800/70 border border-slate-700 text-sm hover:border-${a}-400/60 hover:text-${a}-300 transition">${esc(item)}</span>`
        )
        .join('\n');
      return (
        `    <div class="reveal glow-card rounded-2xl border border-slate-800 bg-slate-900/60 p-7"${delayAttr(i)}>\n` +
        `      <div class="flex items-center gap-3 mb-5">\n` +
        `        <span class="p-2.5 rounded-lg bg-${a}-500/10 text-${a}-400"><svg aria-hidden="true" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${ICONS[group.icon] || ICONS.code}</svg></span>\n` +
        `        <h3 class="font-display font-semibold text-white">${esc(group.title)}</h3>\n` +
        `      </div>\n` +
        `      <div class="flex flex-wrap gap-2.5">\n${pills}\n      </div>\n` +
        `    </div>`
      );
    })
    .join('\n');
}

function projectsBlock() {
  return projects
    .map((p, i) => {
      const bullets = p.bullets
        .map(
          (b) =>
            `          <li class="flex gap-3"><span class="text-cyan-400">▹</span>${esc(b)}</li>`
        )
        .join('\n');
      const tags = p.tags
        .map(
          (t) =>
            `          <span class="px-3 py-1 rounded-md bg-slate-800/70 text-xs font-mono text-cyan-300">${esc(t)}</span>`
        )
        .join('\n');
      const shot = p.screenshot
        ? `      <img src="${esc(p.screenshot)}" alt="Screenshot of ${esc(p.title)}" loading="lazy" class="w-full aspect-[16/10] object-cover object-top border-b border-slate-800" />\n`
        : '';
      const repoLink = p.repo
        ? `          <a href="${esc(p.repo)}" target="_blank" rel="noopener"\n` +
          `             class="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition">\n` +
          `            <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="${GITHUB_PATH}"/></svg>\n` +
          `            Code\n          </a>\n`
        : '';
      const demoLink = p.demo
        ? `          <a href="${esc(p.demo)}" target="_blank" rel="noopener"\n` +
          `             class="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition">\n` +
          `            <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>\n` +
          `            Live Demo\n          </a>\n`
        : '';
      const links =
        repoLink || demoLink
          ? `        <div class="flex gap-4 mt-7 pt-5 border-t border-slate-800">\n${repoLink}${demoLink}        </div>\n`
          : '';
      return (
        `    <article class="reveal glow-card rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col"${delayAttr(i)}>\n` +
        `      <div class="flex items-center gap-2 border-b border-slate-800 px-5 py-3 bg-slate-950/60">\n` +
        `        <span class="h-3 w-3 rounded-full bg-red-500/80"></span>\n` +
        `        <span class="h-3 w-3 rounded-full bg-yellow-500/80"></span>\n` +
        `        <span class="h-3 w-3 rounded-full bg-green-500/80"></span>\n` +
        `        <span class="ml-3 text-xs text-slate-400 font-mono truncate">${esc(p.domain)}</span>\n` +
        `      </div>\n${shot}` +
        `      <div class="p-7 flex flex-col flex-1">\n` +
        `        <h3 class="font-display text-xl font-semibold text-white">${esc(p.title)}</h3>\n` +
        `        <p class="text-sm text-cyan-400 font-medium mt-1">${esc(p.subtitle)}</p>\n` +
        `        <ul class="mt-5 space-y-3 text-sm text-slate-400 leading-relaxed">\n${bullets}\n        </ul>\n` +
        `        <div class="flex flex-wrap gap-2 mt-6">\n${tags}\n        </div>\n${links}` +
        `      </div>\n    </article>`
      );
    })
    .join('\n');
}

function certificationsBlock() {
  return certifications
    .map((c, i) => {
      const a = c.accent || 'cyan';
      const link = c.file
        ? `      <a href="${esc(c.file)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-${a}-400 hover:text-${a}-300 transition">View certificate<svg aria-hidden="true" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>\n`
        : '';
      return (
        `    <div class="reveal glow-card rounded-2xl border border-slate-800 bg-slate-900/60 p-7"${delayAttr(i)}>\n` +
        `      <span class="p-3 rounded-lg bg-${a}-500/10 text-${a}-400 inline-block"><svg aria-hidden="true" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${ICONS.award}</svg></span>\n` +
        `      <h3 class="font-display font-semibold text-white mt-4">${esc(c.title)}</h3>\n` +
        `      <p class="text-sm text-slate-400 mt-2">${esc(c.issuer)}</p>\n${link}` +
        `    </div>`
      );
    })
    .join('\n');
}

function jsonldBlock() {
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: `${hero.firstName} ${hero.lastName}`,
      jobTitle: site.jobTitle,
      email: `mailto:${contact.email}`,
      telephone: contact.phone.replace(/\s/g, '-'),
      image: `${site.url}/${hero.photo}`,
      url: `${site.url}/`,
      address: { '@type': 'PostalAddress', addressRegion: contact.location.split(',')[0].trim(), addressCountry: 'IN' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: site.university },
      knowsAbout: [...new Set(skills.flatMap((g) => g.items))],
      sameAs: [contact.github.url, contact.linkedin.url],
    },
    null,
    2
  );
}

/* ---------- render ---------- */

const data = { site, hero, contact, resume };
const blocks = {
  jsonld: jsonldBlock(),
  intro: introBlock(),
  codeCard: codeCardBlock(),
  marquee: marqueeBlock(),
  stats: statsBlock(),
  skills: skillsBlock(),
  projects: projectsBlock(),
  certifications: certificationsBlock(),
  runtimeConfig: JSON.stringify({
    email: contact.email,
    formEndpoint: contact.formEndpoint || '',
    roles: hero.roles,
  }),
};

const dig = (obj, keyPath) => keyPath.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

let out = fs.readFileSync(path.join(ROOT, 'src', 'index.template.html'), 'utf8');
const unresolved = [];

// raw first, so {{{x}}} is not eaten by the {{x}} pass
out = out.replace(/\{\{\{([a-zA-Z0-9_.]+)\}\}\}/g, (m, key) => {
  const v = key.startsWith('blocks.') ? dig({ blocks }, key) : dig(data, key);
  if (v == null) { unresolved.push(m); return m; }
  return v;
});
out = out.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (m, key) => {
  const v = dig(data, key);
  if (v == null) { unresolved.push(m); return m; }
  return esc(v);
});

if (unresolved.length) {
  console.error('Unresolved placeholders: ' + [...new Set(unresolved)].join(', '));
  process.exit(1);
}

fs.writeFileSync(path.join(ROOT, 'index.html'), out.replace(/\s*$/, '\n'));
console.log(
  `index.html built  —  ${skills.length} skill groups, ${projects.length} projects, ` +
    `${certifications.length} certifications, ${(out.length / 1024).toFixed(1)} KB`
);
