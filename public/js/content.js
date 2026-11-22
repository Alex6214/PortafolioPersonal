// Lectura del contenido público usando la API REST de Firestore.
// No carga el SDK de Firebase (~300 KB), así el portafolio abre más rápido.
import { firebaseConfig, COLLECTIONS } from './config.js';
import { SEED, SEED_PROFILE } from './seed.js';
import { byOrder, isVisible } from './util.js';

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const KEY = `key=${firebaseConfig.apiKey}`;

function decodeValue(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return null;
}

function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

function encodeValue(v) {
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore ${res.status}`);
  return res.json();
}

// Devuelve null si la colección no tiene ningún documento (se usará el CV),
// o la lista de elementos visibles (puede quedar vacía si todos están ocultos).
async function loadCollection(name, signal) {
  const data = await getJson(`${BASE}/${name}?pageSize=300&${KEY}`, signal);
  const docs = data?.documents || [];
  if (docs.length === 0) return null;
  return docs
    .map((d) => ({ id: d.name.split('/').pop(), ...decodeFields(d.fields || {}) }))
    .filter(isVisible)
    .sort(byOrder);
}

// Devuelve { profile, projects, experience, ... , source: 'firestore' | 'seed' }.
// Cada parte que esté vacía o falle usa el contenido inicial del CV.
export async function loadContent() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  const result = { source: 'firestore' };
  try {
    const [profileDoc, ...lists] = await Promise.all([
      getJson(`${BASE}/settings/profile?${KEY}`, ctrl.signal).catch(() => null),
      ...COLLECTIONS.map((c) => loadCollection(c, ctrl.signal).catch(() => null)),
    ]);
    result.profile = profileDoc ? { ...SEED_PROFILE, ...decodeFields(profileDoc.fields || {}) } : null;
    COLLECTIONS.forEach((c, i) => { result[c] = lists[i]; });
  } finally {
    clearTimeout(timer);
  }
  let usedSeed = false;
  if (!result.profile) { result.profile = SEED_PROFILE; usedSeed = true; }
  for (const c of COLLECTIONS) {
    if (!result[c]) {
      result[c] = SEED[c];
      usedSeed = true;
    }
  }
  if (usedSeed) result.source = 'seed';
  return result;
}

// Envía un mensaje de contacto. createdAt lo pone el servidor (REQUEST_TIME),
// tal como exigen las reglas.
export async function sendMessage({ name, email, message }) {
  const id = crypto.randomUUID().replaceAll('-', '');
  const docName = `projects/${firebaseConfig.projectId}/databases/(default)/documents/messages/${id}`;
  const body = {
    writes: [{
      update: {
        name: docName,
        fields: { name: encodeValue(name), email: encodeValue(email), message: encodeValue(message), read: encodeValue(false) },
      },
      currentDocument: { exists: false },
      updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
    }],
  };
  const res = await fetch(`${BASE.replace('/documents', '/documents:commit')}?${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`No se pudo enviar (${res.status})`);
}
