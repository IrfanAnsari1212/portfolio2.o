/** Mirrors the JSON files in /content. Keep in sync with scripts/build-content.js. */

export type Accent = 'cyan' | 'violet' | 'emerald' | 'amber' | 'blue' | 'rose';
export type SkillIcon = 'code' | 'layers' | 'database' | 'wrench';

export interface SkillGroup {
  id: string;
  title: string;
  accent: Accent;
  icon: SkillIcon;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  screenshot: string;
  bullets: string[];
  tags: string[];
  repo: string;
  demo: string;
}

/** A project worked on inside a role — nested under Experience, not a standalone card. */
export interface ExperienceProject {
  id: string;
  name: string;
  description: string;
  bullets: string[];
  tech: string[];
  link: string;
  screenshot: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: string;
  location: string;
  /** Free text, e.g. "Jan 2026". Leave `end` empty for a current role. */
  start: string;
  end: string;
  summary: string;
  projects: ExperienceProject[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  accent: Accent;
  file: string;
}

export interface Hero {
  badge: string;
  firstName: string;
  lastName: string;
  roles: string[];
  intro: string;
  introHighlights: string[];
  photo: string;
  photoAlt: string;
  codeCard: { filename: string; stack: string; state: string; openToWork: boolean };
}

export interface Contact {
  email: string;
  phone: string;
  phoneHref: string;
  linkedin: { label: string; url: string };
  github: { label: string; url: string };
  location: string;
  status: string;
  formEndpoint: string;
}

/** A stat tile either counts something automatically, or shows a fixed value. */
export type StatSource = 'projects' | 'certifications' | 'technologies' | 'experience' | 'custom';

export interface AboutStat {
  label: string;
  source: StatSource;
  value: string;
}

export interface About {
  heading: string;
  /** Plain text. `**bold**` renders as emphasis, `` `backticks` `` as a tech term. */
  paragraphs: string[];
  stats: AboutStat[];
}

export const STAT_SOURCES: StatSource[] = [
  'projects',
  'certifications',
  'technologies',
  'experience',
  'custom',
];

export interface Resume {
  file: string;
  label: string;
  updated: string;
}

/** Every editable file, keyed by its path under /content. */
export interface ContentMap {
  'hero.json': Hero;
  'about.json': About;
  'contact.json': Contact;
  'skills.json': SkillGroup[];
  'projects.json': Project[];
  'experience.json': Experience[];
  'certifications.json': Certification[];
  'resume.json': Resume;
}

export type ContentFile = keyof ContentMap;

export const ACCENTS: Accent[] = ['cyan', 'violet', 'emerald', 'amber', 'blue', 'rose'];
export const SKILL_ICONS: SkillIcon[] = ['code', 'layers', 'database', 'wrench'];
