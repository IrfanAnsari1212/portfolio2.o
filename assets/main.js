// ---------- Shared config ----------
// Injected by scripts/build-content.js from content/contact.json + content/hero.json.
// The fallbacks only matter if the template is opened without a build.
const SITE = window.__SITE__ || {};
const EMAIL = SITE.email || 'irfanking8215@gmail.com';
// Set "formEndpoint" in content/contact.json (Formspree/Web3Forms URL) for real
// inbox delivery. Empty => the form falls back to the visitor's mail client.
const FORM_ENDPOINT = SITE.formEndpoint || '';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Typing effect ----------
const roles = (SITE.roles && SITE.roles.length)
  ? SITE.roles
  : ['React.js Developer', 'JavaScript (ES6+) Enthusiast', 'Tailwind CSS Styler', 'Redux State Manager'];
const typedEl = document.getElementById('typed');
if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  let ri = 0, ci = 0, deleting = false;
  (function tick() {
    const current = roles[ri];
    ci += deleting ? -1 : 1;
    typedEl.textContent = current.slice(0, ci);
    let delay = deleting ? 40 : 90;
    if (!deleting && ci === current.length) { delay = 1500; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
    setTimeout(tick, delay);
  })();
}

// ---------- Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- Navbar / progress / back-to-top ----------
const navbar = document.getElementById('navbar');
const progress = document.getElementById('progress');
const toTop = document.getElementById('toTop');

function onScroll() {
  const y = window.scrollY;
  const scrolled = y > 10;
  navbar.classList.toggle('bg-[#0b1120]/90', scrolled);
  navbar.classList.toggle('backdrop-blur', scrolled);
  navbar.classList.toggle('border-slate-800', scrolled);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  toTop.classList.toggle('opacity-0', y < 400);
  toTop.classList.toggle('pointer-events-none', y < 400);
}

// rAF-throttled: the handler reads layout, so running it raw on every
// scroll event forces a reflow per frame.
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { onScroll(); ticking = false; });
}, { passive: true });

onScroll(); // sync initial state (e.g. reload while scrolled down)

toTop.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
);

// ---------- Active nav link (scroll spy) ----------
const navLinks = document.querySelectorAll('.nav-link');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach((s) => spy.observe(s));

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const iconOpen = document.getElementById('iconOpen');
const iconClose = document.getElementById('iconClose');

function setMenu(open) {
  mobileMenu.classList.toggle('hidden', !open);
  iconOpen.classList.toggle('hidden', open);
  iconClose.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', String(open));
}

menuBtn.addEventListener('click', () =>
  setMenu(mobileMenu.classList.contains('hidden'))
);
mobileMenu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => setMenu(false))
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
    setMenu(false);
    menuBtn.focus();
  }
});
document.addEventListener('click', (e) => {
  if (mobileMenu.classList.contains('hidden')) return;
  if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
});

// ---------- Copy email ----------
document.getElementById('copyEmail').addEventListener('click', async function () {
  try {
    await navigator.clipboard.writeText(EMAIL);
    this.innerHTML = '<svg aria-hidden="true" class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    setTimeout(() => {
      this.innerHTML = '<svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 1600);
  } catch (err) { /* clipboard unavailable */ }
});

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

function setStatus(text, tone) {
  statusEl.textContent = text;
  statusEl.className =
    'text-xs text-center min-h-[1rem] ' +
    (tone === 'ok' ? 'text-emerald-400' : tone === 'err' ? 'text-red-400' : 'text-slate-400');
}

setStatus(FORM_ENDPOINT ? '' : 'Opens your email client with the message pre-filled.');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg = document.getElementById('message').value.trim();

  // No endpoint configured — hand off to the visitor's mail client.
  if (!FORM_ENDPOINT) {
    const subject = encodeURIComponent(`Portfolio Contact — ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setStatus(`If nothing opened, email me directly at ${EMAIL}`);
    return;
  }

  submitBtn.disabled = true;
  setStatus('Sending…');
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    setStatus('Thanks! Your message is on its way.', 'ok');
  } catch (err) {
    setStatus(`Could not send. Please email me at ${EMAIL}`, 'err');
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
