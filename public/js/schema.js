// Definición de los formularios del panel. Agregar un campo aquí lo hace
// aparecer en el panel; para mostrarlo en el sitio, úsalo en site.js.
//
// Tipos: text, textarea, url, email, image (link de Cloudinary con vista previa),
//        lines (una entrada por línea -> arreglo), bool, select, stats.

export const PROFILE_FIELDS = [
  { key: 'name', label: 'Nombre completo', type: 'text', required: true },
  { key: 'headline', label: 'Titular (debajo del nombre)', type: 'text' },
  { key: 'tagline', label: 'Frase principal', type: 'textarea', rows: 2 },
  { key: 'about', label: 'Sobre mí (deja una línea en blanco entre párrafos)', type: 'textarea', rows: 7 },
  { key: 'availability', label: 'Estado (ej. "Abierto a nuevas oportunidades"; vacío = oculto)', type: 'text' },
  { key: 'photoUrl', label: 'Foto de perfil (link de Cloudinary)', type: 'image' },
  { key: 'cvUrl', label: 'Link del CV en PDF (Cloudinary o Drive; vacío = sin botón)', type: 'url' },
  { key: 'location', label: 'Ubicación', type: 'text' },
  { key: 'languages', label: 'Idiomas', type: 'text' },
  { key: 'email', label: 'Correo de contacto', type: 'email' },
  { key: 'whatsapp', label: 'WhatsApp (con código de país, ej. 51999999999; vacío = oculto)', type: 'text' },
  { key: 'linkedin', label: 'LinkedIn (URL)', type: 'url' },
  { key: 'github', label: 'GitHub (URL)', type: 'url' },
  { key: 'stats', label: 'Cifras destacadas (una por línea: valor | descripción)', type: 'stats' },
];

export const SECTIONS = {
  projects: {
    label: 'Proyectos',
    singular: 'proyecto',
    title: (i) => i.title,
    subtitle: (i) => (i.tags || []).join(' · '),
    image: (i) => i.imageUrl,
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'summary', label: 'Descripción corta', type: 'textarea', rows: 3 },
      { key: 'highlights', label: 'Puntos destacados (uno por línea)', type: 'lines', rows: 4 },
      { key: 'tags', label: 'Tecnologías (una por línea)', type: 'lines', rows: 4 },
      { key: 'imageUrl', label: 'Imagen (link de Cloudinary)', type: 'image' },
      { key: 'liveUrl', label: 'Link de la demo', type: 'url' },
      { key: 'repoUrl', label: 'Link del repositorio', type: 'url' },
      { key: 'featured', label: 'Destacado (tarjeta grande)', type: 'bool' },
      { key: 'visible', label: 'Visible en el portafolio', type: 'bool', default: true },
    ],
  },
  experience: {
    label: 'Experiencia',
    singular: 'experiencia',
    title: (i) => i.company,
    subtitle: (i) => `${i.role || ''} · ${i.period || ''}`,
    fields: [
      { key: 'company', label: 'Empresa', type: 'text', required: true },
      { key: 'role', label: 'Cargo', type: 'text' },
      { key: 'period', label: 'Periodo (ej. 2021 — Presente)', type: 'text' },
      { key: 'bullets', label: 'Logros y funciones (uno por línea)', type: 'lines', rows: 7 },
      { key: 'visible', label: 'Visible en el portafolio', type: 'bool', default: true },
    ],
  },
  skills: {
    label: 'Habilidades',
    singular: 'grupo',
    title: (i) => i.group,
    subtitle: (i) => (i.items || []).join(' · '),
    fields: [
      { key: 'group', label: 'Nombre del grupo', type: 'text', required: true },
      {
        key: 'icon', label: 'Ícono', type: 'select',
        options: [['data', 'Base de datos'], ['ai', 'Inteligencia Artificial'], ['web', 'Web / Código'], ['bi', 'Gráficos / BI'], ['tool', 'Herramienta']],
      },
      { key: 'items', label: 'Habilidades (una por línea)', type: 'lines', rows: 6 },
      { key: 'visible', label: 'Visible en el portafolio', type: 'bool', default: true },
    ],
  },
  certifications: {
    label: 'Certificaciones',
    singular: 'certificación',
    title: (i) => i.name,
    subtitle: (i) => `${i.issuer || ''} · ${i.year || ''}`,
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'issuer', label: 'Institución', type: 'text' },
      { key: 'year', label: 'Año', type: 'text' },
      { key: 'url', label: 'Link del certificado (opcional)', type: 'url' },
      { key: 'visible', label: 'Visible en el portafolio', type: 'bool', default: true },
    ],
  },
  education: {
    label: 'Formación',
    singular: 'estudio',
    title: (i) => i.title,
    subtitle: (i) => `${i.institution || ''} · ${i.period || ''}`,
    fields: [
      { key: 'title', label: 'Carrera o programa', type: 'text', required: true },
      { key: 'institution', label: 'Institución', type: 'text' },
      { key: 'period', label: 'Periodo', type: 'text' },
      { key: 'visible', label: 'Visible en el portafolio', type: 'bool', default: true },
    ],
  },
};
