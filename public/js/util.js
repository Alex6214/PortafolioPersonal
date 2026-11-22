// Utilidades compartidas por el sitio y el panel.

// Escapa texto para insertarlo en HTML.
export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Devuelve la URL solo si es http(s); evita enlaces "javascript:" y similares.
export function safeUrl(value) {
  if (!value) return '';
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '';
  } catch {
    return '';
  }
}

export function isCloudinary(url) {
  try {
    return new URL(url).hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

// Optimiza una imagen de Cloudinary: formato automático (WebP/AVIF), calidad
// automática y ancho máximo. Si el link ya trae transformaciones, lo respeta.
// Ej.: .../image/upload/v177.../foto.jpg -> .../image/upload/f_auto,q_auto,c_limit,w_800/v177.../foto.jpg
export function cld(url, width) {
  const href = safeUrl(url);
  if (!href || !isCloudinary(href)) return href;
  const [base, rest] = href.split('/upload/');
  if (!rest) return href;
  const firstSegment = rest.split('/')[0];
  const hasTransform = /(^|,)[a-z]{1,3}_[^/]+/.test(firstSegment) && !/^v\d+$/.test(firstSegment);
  if (hasTransform) return href;
  const t = ['f_auto', 'q_auto', width ? `c_limit,w_${width}` : ''].filter(Boolean).join(',');
  return `${base}/upload/${t}/${rest}`;
}

export const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
export const isVisible = (item) => item.visible !== false;
