// Panel administrativo del portafolio.
import { auth, db } from './firebase.js';
import {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, getDocs,
  query, orderBy, limit, writeBatch, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { PROFILE_FIELDS, SECTIONS } from './schema.js';
import { SEED_PROFILE, seedItems } from './seed.js';
import { COLLECTIONS } from './config.js';
import { esc, cld, isCloudinary, safeUrl } from './util.js';

const $ = (sel, root = document) => root.querySelector(sel);

const TABS = [
  { id: 'profile', label: 'Perfil', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>' },
  { id: 'projects', label: 'Proyectos', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/></svg>' },
  { id: 'experience', label: 'Experiencia', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>' },
  { id: 'skills', label: 'Habilidades', icon: '<svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>' },
  { id: 'certifications', label: 'Certificaciones', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></svg>' },
  { id: 'education', label: 'Formación', icon: '<svg viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>' },
  { id: 'messages', label: 'Mensajes', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>' },
];

let currentTab = 'profile';
let cache = {}; // datos cargados por pestaña

/* ================= Utilidades de interfaz ================= */
function show(id) {
  for (const s of ['screenLoading', 'screenLogin', 'screenDenied', 'screenApp']) $(`#${s}`).hidden = s !== id;
}

let toastTimer;
function toast(msg, type = 'ok') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast is-on toast--${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

function friendlyError(err) {
  const code = err?.code || '';
  if (code.includes('permission-denied')) return 'Sin permiso. ¿Tu cuenta está en la colección admins?';
  if (code.includes('unavailable')) return 'Sin conexión con Firestore. Revisa tu internet.';
  if (code.includes('popup-closed')) return 'Cerraste la ventana de Google antes de terminar.';
  if (code.includes('unauthorized-domain')) return 'Este dominio no está autorizado en Firebase Authentication.';
  if (code.includes('operation-not-allowed') || code.includes('configuration-not-found')) return 'El acceso con Google no está activado en Firebase Authentication.';
  return err?.message || 'Ocurrió un error.';
}

/* ================= Campos de formulario ================= */
function fieldHtml(f, value) {
  const id = `f_${f.key}`;
  const v = value ?? f.default ?? (f.type === 'bool' ? false : '');
  const req = f.required ? 'required' : '';
  switch (f.type) {
    case 'textarea':
      return `<label class="field"><span>${esc(f.label)}</span><textarea id="${id}" name="${f.key}" rows="${f.rows || 3}" ${req}>${esc(v)}</textarea></label>`;
    case 'lines':
      return `<label class="field"><span>${esc(f.label)}</span><textarea id="${id}" name="${f.key}" rows="${f.rows || 4}">${esc((v || []).join('\n'))}</textarea></label>`;
    case 'stats':
      return `<label class="field"><span>${esc(f.label)}</span><textarea id="${id}" name="${f.key}" rows="4" class="mono">${esc((v || []).map((s) => `${s.value} | ${s.label}`).join('\n'))}</textarea></label>`;
    case 'bool':
      return `<label class="check"><input type="checkbox" id="${id}" name="${f.key}" ${v ? 'checked' : ''}><span>${esc(f.label)}</span></label>`;
    case 'select':
      return `<label class="field"><span>${esc(f.label)}</span><select id="${id}" name="${f.key}">${f.options.map(([val, txt]) => `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(txt)}</option>`).join('')}</select></label>`;
    case 'image':
      return `<div class="field field--image">
          <label for="${id}">${esc(f.label)}</label>
          <div class="image-input">
            <div class="image-input__preview" data-preview="${f.key}"></div>
            <div class="image-input__side">
              <input id="${id}" name="${f.key}" type="url" inputmode="url" placeholder="https://res.cloudinary.com/…/image/upload/…/foto.jpg" value="${esc(v)}">
              <p class="hint" data-hint="${f.key}"></p>
            </div>
          </div>
        </div>`;
    default:
      return `<label class="field"><span>${esc(f.label)}</span><input id="${id}" name="${f.key}" type="${f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : 'text'}" value="${esc(v)}" ${req}></label>`;
  }
}

// Vista previa en vivo de los campos de imagen.
function wireImageFields(root) {
  root.querySelectorAll('.field--image input').forEach((input) => {
    const key = input.name;
    const preview = $(`[data-preview="${key}"]`, root);
    const hint = $(`[data-hint="${key}"]`, root);
    const update = () => {
      const url = input.value.trim();
      if (!url) {
        preview.innerHTML = '<span>Sin imagen</span>';
        hint.textContent = 'Sube la imagen a Cloudinary, copia su link y pégalo aquí.';
        hint.className = 'hint';
        return;
      }
      if (!safeUrl(url)) {
        preview.innerHTML = '<span>Link inválido</span>';
        hint.textContent = 'El link debe empezar con https://';
        hint.className = 'hint hint--err';
        return;
      }
      if (!isCloudinary(url)) {
        preview.innerHTML = '<span>Solo Cloudinary</span>';
        hint.textContent = 'Por seguridad, el sitio solo muestra imágenes de res.cloudinary.com.';
        hint.className = 'hint hint--err';
        return;
      }
      const img = new Image();
      img.alt = 'Vista previa';
      img.onerror = () => { preview.innerHTML = '<span>No se pudo cargar</span>'; hint.textContent = 'Revisa que el link sea correcto y público.'; hint.className = 'hint hint--err'; };
      img.onload = () => { hint.textContent = 'Se optimiza automáticamente (formato y tamaño).'; hint.className = 'hint hint--ok'; };
      img.src = cld(url, 480);
      preview.replaceChildren(img);
    };
    input.addEventListener('input', update);
    update();
  });
}

function readFields(fields, form) {
  const data = {};
  for (const f of fields) {
    const el = form.elements[f.key];
    if (!el) continue;
    if (f.type === 'bool') data[f.key] = el.checked;
    else if (f.type === 'lines') data[f.key] = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    else if (f.type === 'stats') {
      data[f.key] = el.value.split('\n').map((line) => {
        const [value, ...rest] = line.split('|');
        return { value: (value || '').trim(), label: rest.join('|').trim() };
      }).filter((s) => s.value);
    } else data[f.key] = el.value.trim();
  }
  return data;
}

function validate(fields, data) {
  for (const f of fields) {
    if (f.required && !data[f.key]) return `"${f.label}" es obligatorio.`;
    if ((f.type === 'url' || f.type === 'image') && data[f.key] && !safeUrl(data[f.key])) return `"${f.label}" debe ser un link válido (https://…).`;
    if (f.type === 'image' && data[f.key] && !isCloudinary(data[f.key])) return `"${f.label}" debe ser un link de Cloudinary.`;
    if (f.type === 'email' && data[f.key] && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data[f.key])) return `"${f.label}" no es un correo válido.`;
  }
  return null;
}

/* ================= Navegación ================= */
function renderNav() {
  const unread = (cache.messages || []).filter((m) => !m.read).length;
  $('#sideNav').innerHTML = TABS.map((t) => `
    <button type="button" class="side__link ${t.id === currentTab ? 'is-active' : ''}" data-tab="${t.id}">
      ${t.icon}<span>${t.label}</span>
      ${t.id === 'messages' && unread ? `<em class="badge">${unread}</em>` : ''}
    </button>`).join('');
}

async function go(tab) {
  currentTab = tab;
  renderNav();
  const main = $('#main');
  main.innerHTML = '<div class="center pad"><div class="spinner"></div></div>';
  try {
    if (tab === 'profile') await renderProfile();
    else if (tab === 'messages') await renderMessages();
    else await renderSection(tab);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="empty"><h2>No se pudo cargar</h2><p class="muted">${esc(friendlyError(err))}</p></div>`;
  }
  main.focus?.();
}

/* ================= Perfil ================= */
async function renderProfile() {
  const snap = await getDoc(doc(db, 'settings', 'profile'));
  const exists = snap.exists();
  const profile = exists ? snap.data() : SEED_PROFILE;
  const emptyCols = [];
  for (const col of COLLECTIONS) {
    if ((await getDocs(query(collection(db, col), limit(1)))).empty) emptyCols.push(SECTIONS[col].label);
  }
  const needsSeed = !exists || emptyCols.length > 0;
  const main = $('#main');
  main.innerHTML = `
    <header class="page-head">
      <div>
        <h1>Perfil</h1>
        <p class="muted">Lo que aparece en la portada, "Sobre mí" y contacto.</p>
      </div>
    </header>
    ${!needsSeed ? '' : `
      <div class="banner">
        <div>
          <strong>${exists ? `Faltan secciones por cargar: ${esc(emptyCols.join(', '))}.` : 'Tu base de datos está vacía.'}</strong>
          <p>El sitio muestra el contenido de tu CV como respaldo. Cárgalo a Firestore para poder editarlo desde aquí. Lo que ya guardaste no se toca.</p>
        </div>
        <button class="btn btn--primary" id="seedAll" type="button">Cargar contenido inicial</button>
      </div>`}
    <form class="card form-grid" id="profileForm" novalidate>
      ${PROFILE_FIELDS.map((f) => fieldHtml(f, profile[f.key])).join('')}
      <div class="form-actions">
        <button class="btn btn--primary" type="submit">Guardar perfil</button>
      </div>
    </form>`;
  const form = $('#profileForm');
  wireImageFields(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = readFields(PROFILE_FIELDS, form);
    const error = validate(PROFILE_FIELDS, data);
    if (error) { toast(error, 'err'); return; }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      await setDoc(doc(db, 'settings', 'profile'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      toast('Perfil guardado. Ya se ve en el portafolio.');
    } catch (err) { toast(friendlyError(err), 'err'); } finally { btn.disabled = false; }
  });
  $('#seedAll')?.addEventListener('click', seedAll);
}

async function seedAll() {
  if (!confirm('Se cargará el contenido de tu CV (perfil, proyectos, experiencia, habilidades, certificaciones y formación). Las secciones que ya tengan datos no se tocan. ¿Continuar?')) return;
  try {
    const batch = writeBatch(db);
    const profileSnap = await getDoc(doc(db, 'settings', 'profile'));
    if (!profileSnap.exists()) batch.set(doc(db, 'settings', 'profile'), { ...SEED_PROFILE, updatedAt: serverTimestamp() });
    for (const col of COLLECTIONS) {
      const existing = await getDocs(collection(db, col));
      if (!existing.empty) continue;
      for (const item of seedItems(col)) batch.set(doc(collection(db, col)), { ...item, updatedAt: serverTimestamp() });
    }
    await batch.commit();
    cache = {};
    toast('Contenido inicial cargado.');
    go(currentTab);
  } catch (err) { toast(friendlyError(err), 'err'); }
}

/* ================= Secciones (listas) ================= */
async function loadSection(col) {
  const snap = await getDocs(query(collection(db, col), orderBy('order')));
  cache[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return cache[col];
}

async function renderSection(col) {
  const def = SECTIONS[col];
  const items = await loadSection(col);
  const main = $('#main');
  main.innerHTML = `
    <header class="page-head">
      <div>
        <h1>${esc(def.label)}</h1>
        <p class="muted">${items.length} ${items.length === 1 ? 'elemento' : 'elementos'} · usa las flechas para cambiar el orden.</p>
      </div>
      <button class="btn btn--primary" id="addBtn" type="button">+ Nuevo ${esc(def.singular)}</button>
    </header>
    ${items.length === 0 ? `
      <div class="empty card">
        <h2>Aún no hay ${esc(def.label.toLowerCase())}</h2>
        <p class="muted">Crea el primero o carga los de tu CV.</p>
        <div class="row">
          <button class="btn" id="seedOne" type="button">Cargar desde mi CV</button>
        </div>
      </div>` : `
      <ul class="items">
        ${items.map((it, i) => {
          const img = def.image ? cld(def.image(it), 160) : '';
          return `
          <li class="item ${it.visible === false ? 'is-hidden' : ''}" data-id="${esc(it.id)}">
            ${def.image ? `<div class="item__thumb">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : '<span>Sin imagen</span>'}</div>` : ''}
            <div class="item__text">
              <strong>${esc(def.title(it) || '(sin título)')}</strong>
              <small>${esc(def.subtitle(it))}</small>
              <div class="item__badges">
                ${it.visible === false ? '<span class="tag tag--muted">Oculto</span>' : ''}
                ${it.featured ? '<span class="tag">Destacado</span>' : ''}
              </div>
            </div>
            <div class="item__actions">
              <button class="icon-btn" data-act="up" ${i === 0 ? 'disabled' : ''} aria-label="Subir" title="Subir">↑</button>
              <button class="icon-btn" data-act="down" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Bajar" title="Bajar">↓</button>
              <button class="icon-btn" data-act="toggle" aria-label="${it.visible === false ? 'Mostrar' : 'Ocultar'}" title="${it.visible === false ? 'Mostrar' : 'Ocultar'}">${it.visible === false
                ? '<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A16.6 16.6 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/></svg>'
                : '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'}</button>
              <button class="btn btn--sm" data-act="edit">Editar</button>
              <button class="icon-btn icon-btn--danger" data-act="delete" aria-label="Eliminar" title="Eliminar"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>
            </div>
          </li>`;
        }).join('')}
      </ul>`}`;

  $('#addBtn').addEventListener('click', () => openEditor(col, null));
  $('#seedOne')?.addEventListener('click', async () => {
    try {
      const batch = writeBatch(db);
      for (const item of seedItems(col)) batch.set(doc(collection(db, col)), { ...item, updatedAt: serverTimestamp() });
      await batch.commit();
      toast('Datos cargados desde tu CV.');
      go(col);
    } catch (err) { toast(friendlyError(err), 'err'); }
  });

  main.querySelector('.items')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.item').dataset.id;
    const idx = items.findIndex((x) => x.id === id);
    const item = items[idx];
    try {
      switch (btn.dataset.act) {
        case 'edit': openEditor(col, item); return;
        case 'toggle':
          await updateDoc(doc(db, col, id), { visible: item.visible === false, updatedAt: serverTimestamp() });
          toast(item.visible === false ? 'Ahora es visible en el portafolio.' : 'Oculto del portafolio.');
          break;
        case 'delete':
          if (!confirm(`¿Eliminar "${def.title(item)}"? No se puede deshacer.`)) return;
          await deleteDoc(doc(db, col, id));
          toast('Eliminado.');
          break;
        case 'up':
        case 'down': {
          const to = btn.dataset.act === 'up' ? idx - 1 : idx + 1;
          const reordered = [...items];
          [reordered[idx], reordered[to]] = [reordered[to], reordered[idx]];
          const batch = writeBatch(db);
          reordered.forEach((x, i) => { if (x.order !== i) batch.update(doc(db, col, x.id), { order: i }); });
          await batch.commit();
          break;
        }
        default: return;
      }
      go(col);
    } catch (err) { toast(friendlyError(err), 'err'); }
  });
}

/* ================= Editor (diálogo) ================= */
function openEditor(col, item) {
  const def = SECTIONS[col];
  const dialog = $('#editor');
  const form = $('#editorForm');
  $('#editorTitle').textContent = item ? `Editar ${def.singular}` : `Nuevo ${def.singular}`;
  $('#editorBody').innerHTML = def.fields.map((f) => fieldHtml(f, item ? item[f.key] : undefined)).join('');
  wireImageFields($('#editorBody'));

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (e.submitter?.value !== 'save') { dialog.close(); return; }
    const data = readFields(def.fields, form);
    const error = validate(def.fields, data);
    if (error) { toast(error, 'err'); return; }
    const btn = $('#editorSave');
    btn.disabled = true;
    try {
      if (item) {
        await updateDoc(doc(db, col, item.id), { ...data, updatedAt: serverTimestamp() });
      } else {
        const list = cache[col] || [];
        const order = list.length ? Math.max(...list.map((x) => x.order ?? 0)) + 1 : 0;
        await addDoc(collection(db, col), { ...data, order, updatedAt: serverTimestamp() });
      }
      dialog.close();
      toast('Guardado. Ya se ve en el portafolio.');
      go(col);
    } catch (err) { toast(friendlyError(err), 'err'); } finally { btn.disabled = false; }
  };
  dialog.showModal();
  setTimeout(() => form.querySelector('input, textarea')?.focus(), 30);
}

/* ================= Mensajes ================= */
async function loadMessages() {
  const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
  cache.messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return cache.messages;
}

async function renderMessages() {
  const list = await loadMessages();
  renderNav();
  const fmt = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
  const main = $('#main');
  main.innerHTML = `
    <header class="page-head">
      <div>
        <h1>Mensajes</h1>
        <p class="muted">Lo que te escriben desde el formulario de contacto.</p>
      </div>
    </header>
    ${list.length === 0 ? '<div class="empty card"><h2>Sin mensajes todavía</h2><p class="muted">Cuando alguien te escriba desde el portafolio, aparecerá aquí.</p></div>' : `
    <ul class="messages">
      ${list.map((m) => `
        <li class="message card ${m.read ? '' : 'is-unread'}" data-id="${esc(m.id)}">
          <div class="message__head">
            <div><strong>${esc(m.name)}</strong> <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>
            <time>${m.createdAt?.toDate ? esc(fmt.format(m.createdAt.toDate())) : ''}</time>
          </div>
          <p class="message__body">${esc(m.message)}</p>
          <div class="row">
            <a class="btn btn--sm btn--primary" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: tu mensaje en mi portafolio')}">Responder</a>
            ${m.read ? '' : '<button class="btn btn--sm" data-act="read">Marcar como leído</button>'}
            <button class="btn btn--sm btn--ghost" data-act="delete">Eliminar</button>
          </div>
        </li>`).join('')}
    </ul>`}`;

  main.querySelector('.messages')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.message').dataset.id;
    try {
      if (btn.dataset.act === 'read') await updateDoc(doc(db, 'messages', id), { read: true });
      if (btn.dataset.act === 'delete') {
        if (!confirm('¿Eliminar este mensaje? No se puede deshacer.')) return;
        await deleteDoc(doc(db, 'messages', id));
      }
      go('messages');
    } catch (err) { toast(friendlyError(err), 'err'); }
  });
}

/* ================= Sesión ================= */
$('#loginBtn').addEventListener('click', async () => {
  $('#loginError').textContent = '';
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  } catch (err) {
    $('#loginError').textContent = friendlyError(err);
  }
});
$('#logoutBtn').addEventListener('click', () => signOut(auth));
$('#deniedLogout').addEventListener('click', () => signOut(auth));
$('#copyUid').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#deniedUid').textContent); toast('UID copiado.'); } catch { toast('Cópialo manualmente.', 'err'); }
});
$('#sideNav').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (b) go(b.dataset.tab);
});

onAuthStateChanged(auth, async (user) => {
  cache = {};
  if (!user) { show('screenLogin'); return; }
  show('screenLoading');
  let isAdmin = false;
  try {
    isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists();
  } catch (err) {
    console.warn('No se pudo verificar el rol', err);
  }
  if (!isAdmin) {
    $('#deniedEmail').textContent = user.email || '';
    $('#deniedUid').textContent = user.uid;
    show('screenDenied');
    return;
  }
  $('#userBox').innerHTML = `
    ${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}
    <span>${esc(user.displayName || user.email)}</span>`;
  show('screenApp');
  go(currentTab);
  // Contador de mensajes sin leer en el menú.
  loadMessages().then(renderNav).catch(() => {});
});
