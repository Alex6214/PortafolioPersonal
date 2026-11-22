// Portafolio público: carga el contenido y lo dibuja.
import { loadContent, sendMessage } from './content.js';
import { esc, safeUrl, cld } from './util.js';

const $ = (sel) => document.querySelector(sel);

const ICONS = {
  data: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  ai: '<svg viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6M2 12h3M19 12h3"/></svg>',
  web: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14l-2 2 2 2M16 14l2 2-2 2"/></svg>',
  bi: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15v2M11 11v6M15 7v10M19 12v5"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  github: '<svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 10c0 3 2 5 5 5l1.5-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2z"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  external: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};

/* ---------- Tema claro / oscuro ---------- */
function initTheme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* sin almacenamiento */ }
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = saved || system;
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch { /* sin almacenamiento */ }
  });
}

/* ---------- Navegación ---------- */
function initNav() {
  const nav = $('#nav');
  const btn = $('#menuBtn');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
  });
  const topbar = $('#topbar');
  const onScroll = () => topbar.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Resalta la sección visible en el menú.
  const links = [...nav.querySelectorAll('a')];
  const spy = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));
}

function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.is-in)');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------- Render ---------- */
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function paragraphs(text) {
  return String(text || '').split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
}

function contactItems(p) {
  const items = [];
  if (p.email) items.push({ href: `mailto:${p.email}`, icon: 'mail', label: p.email });
  const wa = String(p.whatsapp || '').replace(/\D/g, '');
  if (wa) items.push({ href: `https://wa.me/${wa}`, icon: 'whatsapp', label: 'WhatsApp' });
  if (safeUrl(p.linkedin)) items.push({ href: safeUrl(p.linkedin), icon: 'linkedin', label: 'LinkedIn' });
  if (safeUrl(p.github)) items.push({ href: safeUrl(p.github), icon: 'github', label: 'GitHub' });
  return items;
}

function renderProfile(p, education) {
  document.title = `${p.name} — Portafolio`;
  $('#brandName').textContent = p.name.split(' ').slice(0, 2).join(' ');
  $('#brandMark').textContent = initials(p.name);
  $('#heroName').textContent = p.name;
  $('#heroHeadline').textContent = p.headline || '';
  $('#heroTagline').textContent = p.tagline || '';
  $('#footerName').textContent = p.name;
  $('#year').textContent = new Date().getFullYear();

  const pill = $('#availability');
  pill.hidden = !p.availability;
  pill.lastElementChild.textContent = p.availability || '';

  const cv = safeUrl(p.cvUrl);
  $('#cvBtn').hidden = !cv;
  if (cv) $('#cvBtn').href = cv;

  const avatar = $('#avatar');
  const photo = cld(p.photoUrl, 700);
  avatar.innerHTML = photo
    ? `<img src="${esc(photo)}" alt="Foto de ${esc(p.name)}" width="340" height="340">`
    : `<span>${esc(initials(p.name))}</span>`;

  const stats = Array.isArray(p.stats) ? p.stats.filter((s) => s && s.value) : [];
  $('#stats').hidden = stats.length === 0;
  $('#stats').innerHTML = stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join('');

  $('#aboutText').innerHTML = paragraphs(p.about);
  $('#factLocation').textContent = p.location || '—';
  $('#factLanguages').textContent = p.languages || '—';
  $('#factEducation').textContent = education[0] ? `${education[0].title} · ${education[0].institution}` : '—';

  const items = contactItems(p);
  $('#heroSocials').innerHTML = items.map((c) => `
    <li><a href="${esc(c.href)}" ${c.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} aria-label="${esc(c.label)}" title="${esc(c.label)}">${ICONS[c.icon]}</a></li>`).join('');
  $('#contactLinks').innerHTML = [
    ...items.map((c) => `<li><a href="${esc(c.href)}" ${c.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${ICONS[c.icon]}<span>${esc(c.label)}</span></a></li>`),
    p.location ? `<li><a>${ICONS.pin}<span>${esc(p.location)}</span></a></li>` : '',
  ].join('');
}

function renderProjects(list) {
  // Los destacados van primero, en su propio orden.
  const sorted = [...list.filter((p) => p.featured), ...list.filter((p) => !p.featured)];
  $('#projects').innerHTML = sorted.map((p) => {
    const img = cld(p.imageUrl, p.featured ? 1100 : 800);
    const live = safeUrl(p.liveUrl);
    const repo = safeUrl(p.repoUrl);
    const tags = (p.tags || []).filter(Boolean);
    const points = (p.highlights || []).filter(Boolean);
    return `
      <article class="project reveal ${p.featured ? 'project--featured' : ''}">
        <div class="project__media">
          ${img
            ? `<img src="${esc(img)}" alt="Captura de ${esc(p.title)}" loading="lazy" decoding="async">`
            : `<div class="project__placeholder">${esc(p.title)}</div>`}
        </div>
        <div class="project__body">
          ${p.featured ? '<span class="project__badge">Destacado</span>' : ''}
          <h3>${esc(p.title)}</h3>
          ${p.summary ? `<p class="project__summary">${esc(p.summary)}</p>` : ''}
          ${points.length ? `<ul class="points">${points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          ${live || repo ? `<div class="project__links">
            ${live ? `<a class="btn btn--primary" href="${esc(live)}" target="_blank" rel="noopener">${ICONS.external} Ver demo</a>` : ''}
            ${repo ? `<a class="btn" href="${esc(repo)}" target="_blank" rel="noopener">${ICONS.github} Código</a>` : ''}
          </div>` : ''}
        </div>
      </article>`;
  }).join('');
}

function renderExperience(list) {
  $('#experience').innerHTML = list.map((j) => `
    <li class="job reveal">
      <div class="job__head">
        <h3 class="job__company">${esc(j.company)}</h3>
        <span class="job__period">${esc(j.period)}</span>
      </div>
      <p class="job__role">${esc(j.role)}</p>
      ${(j.bullets || []).length ? `<ul>${j.bullets.filter(Boolean).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </li>`).join('');
}

function renderSkills(list) {
  $('#skills').innerHTML = list.map((s) => `
    <div class="skill reveal">
      <div class="skill__icon">${ICONS[s.icon] || ICONS.tool}</div>
      <h3>${esc(s.group)}</h3>
      <ul>${(s.items || []).filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>`).join('');
}

function renderCerts(list) {
  $('#certifications').innerHTML = list.map((c) => {
    const url = safeUrl(c.url);
    const inner = `<div><strong>${esc(c.name)}</strong><small>${esc(c.issuer)}</small></div><span class="year">${esc(c.year)}</span>`;
    return `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" style="display:contents">${inner}</a>` : inner}</li>`;
  }).join('');
}

function renderEducation(list) {
  $('#education').innerHTML = list.map((e) => `
    <li><div><strong>${esc(e.title)}</strong><small>${esc(e.institution)}</small></div><span class="year">${esc(e.period)}</span></li>`).join('');
}

/* ---------- Contacto ---------- */
function initContact() {
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    status.className = 'form__status';
    if (data.website) return; // bot
    const name = data.name.trim();
    const email = data.email.trim();
    const message = data.message.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 5) {
      status.textContent = 'Completa tu nombre, un correo válido y un mensaje.';
      status.classList.add('err');
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true;
    status.textContent = 'Enviando…';
    try {
      await sendMessage({ name, email, message });
      form.reset();
      status.textContent = '¡Gracias! Recibí tu mensaje y te responderé pronto.';
      status.classList.add('ok');
    } catch {
      status.textContent = 'No se pudo enviar. Escríbeme directamente al correo.';
      status.classList.add('err');
    } finally {
      btn.disabled = false;
    }
  });
}

/* ---------- Inicio ---------- */
initTheme();
initNav();
initContact();

const content = await loadContent();
renderProfile(content.profile, content.education);
renderProjects(content.projects);
renderExperience(content.experience);
renderSkills(content.skills);
renderCerts(content.certifications);
renderEducation(content.education);
initReveal();
