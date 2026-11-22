// Contenido inicial tomado del CV. Se usa:
//  1) como respaldo en el sitio público mientras Firestore esté vacío, y
//  2) desde el panel ("Cargar contenido inicial") para llenar Firestore.
// Después de cargarlo, todo se edita desde /admin.

export const SEED_PROFILE = {
  name: 'Alexander Guevara Morán',
  headline: 'TI Payroll, Finance & HR Systems · Data Analyst · AI Developer',
  tagline: 'Automatizo nóminas, datos y procesos financieros con SQL Server, Python e Inteligencia Artificial.',
  about:
    'Soy Analista de TI BPS con más de 5 años de experiencia en análisis financiero, formulación de nóminas y automatización de procesos en entornos corporativos. Me especializo en SQL Server, ETL y Python.\n\n' +
    'Hoy combino ese conocimiento del negocio con Inteligencia Artificial aplicada: agentes de búsqueda web en tiempo real, flujos automatizados con n8n y aplicaciones web con LLMs publicadas en producción.',
  location: 'Lima, Perú',
  email: 'alexander.guevaram@hotmail.com',
  whatsapp: '',
  linkedin: '',
  github: 'https://github.com/Alex6214',
  photoUrl: '',
  cvUrl: '',
  availability: 'Abierto a nuevas oportunidades',
  languages: 'Español (nativo) · Inglés (B1)',
  stats: [
    { value: '+5', label: 'años en TI corporativa' },
    { value: '+200', label: 'stored procedures T-SQL' },
    { value: '95%', label: 'menos errores en carga de datos' },
    { value: '80%', label: 'menos tiempo en procesos de nómina' },
  ],
};

export const SEED = {
  projects: [
    {
      title: 'Vota Informado Perú 2026',
      summary: 'App web con IA para consultar perfiles, propuestas y antecedentes de los 36 candidatos presidenciales en tiempo real.',
      highlights: [
        'Búsqueda web en tiempo real con Tavily y respuestas con LLaMA 3.3 70B (Groq).',
        'Arquitectura modular con servicios separados por responsabilidad.',
        'Feedback de usuarios guardado en Google Sheets vía Apps Script.',
      ],
      tags: ['Python', 'Streamlit', 'Groq · LLaMA 3.3', 'Tavily', 'Apps Script'],
      imageUrl: '',
      liveUrl: 'https://vota-informado-peru2026.streamlit.app/',
      repoUrl: '',
      featured: true,
    },
    {
      title: 'InvitaYa — Invitaciones digitales',
      summary: 'Landing comercial y sistema de invitaciones digitales para bodas, quinceañeros, bautizos y eventos corporativos.',
      highlights: [
        'Formulario de cotización multipaso con envío de correos (FormSubmit).',
        'Cuenta regresiva en vivo y confirmación de asistencia.',
        'UX optimizada para conversión comercial.',
      ],
      tags: ['HTML5', 'CSS3', 'JavaScript', 'FormSubmit'],
      imageUrl: 'https://res.cloudinary.com/dmqvswizl/image/upload/v1777011115/ImageBoda_i9hkbb.jpg',
      liveUrl: 'https://invitaya.netlify.app/',
      repoUrl: '',
      featured: true,
    },
    {
      title: 'Amigo Secreto Navideño',
      summary: 'Plataforma para organizar intercambios de regalos: grupos privados, sorteo seguro y listas de deseos.',
      highlights: [
        'Acceso con Google o correo, con verificación obligatoria.',
        'Sorteo atómico validado por reglas de seguridad de Firestore.',
        'Compartir por WhatsApp y recordatorio en calendario (.ics).',
      ],
      tags: ['JavaScript', 'Firebase Auth', 'Firestore', 'Security Rules'],
      imageUrl: '',
      liveUrl: 'https://amigosecreto-app.web.app',
      repoUrl: '',
      featured: false,
    },
    {
      title: 'Mi Control Financiero',
      summary: 'App multiusuario de finanzas personales: tarjetas, cuotas, ingresos, deudas y reportes, con datos aislados por usuario.',
      highlights: [
        'Integración con Hotmail vía Microsoft Graph y Cloudflare Workers.',
        'Espacios privados por usuario con reglas de Firestore.',
      ],
      tags: ['JavaScript', 'Firebase', 'Cloudflare Workers', 'Microsoft Graph'],
      imageUrl: '',
      liveUrl: 'https://mi-control-financiero-ag.web.app',
      repoUrl: '',
      featured: false,
    },
    {
      title: 'Modu — Gestión humana',
      summary: 'Base de un sistema de RR.HH. con ingreso en dos pasos (Microsoft Authenticator), roles y permisos por módulo.',
      highlights: [
        'Roles y permisos configurables con bitácora de accesos.',
        'PostgreSQL en Supabase.',
      ],
      tags: ['Python', 'Django', 'PostgreSQL', 'Supabase', '2FA'],
      imageUrl: '',
      liveUrl: '',
      repoUrl: '',
      featured: false,
    },
  ],
  experience: [
    {
      company: 'Deloitte Perú',
      role: 'Asistente Soporte TI BPS — IT Payroll, Finance & HR Systems',
      period: '2021 — Presente',
      bullets: [
        'Formulación de fórmulas de nómina por cliente: gratificaciones, renta de 5ta categoría, liquidaciones y provisiones.',
        'Automatización de carga y validación de CSV hacia SQL Server, reduciendo errores operativos en más del 95%.',
        'Procesos ETL para consolidar información financiera y de nómina (gratificaciones, CTS, utilidades).',
        'Más de 100 stored procedures y funciones T-SQL para validar cálculos y provisiones contables.',
        'Optimización de procesos de nómina con reducción de tiempos operativos superior al 80%.',
        'Portal web de boletas de pago, vacaciones y ausencias.',
        'Archivos de pago bancarios (XML, TXT) y validación de asientos contables de nómina.',
      ],
    },
    {
      company: 'Maderas América S.A.C.',
      role: 'Analista de Sistemas',
      period: '2021 · 6 meses',
      bullets: [
        'Lideré la migración completa del ERP integrando todas las áreas y capacitando a más de 40 usuarios.',
        'Soluciones internas con Dart, Flutter y Firebase para mejorar la comunicación.',
        'Análisis de ventas con Python (Pandas, NumPy, Matplotlib).',
      ],
    },
    {
      company: 'Representaciones Richard',
      role: 'Analista de Sistemas',
      period: '2016 — 2021',
      bullets: [
        'ETL de ventas desde Excel/CSV con validación de productos y clientes: 5 mil registros diarios sin errores.',
        'Sistema de asistencia en Java JSP + SQL Server con cálculo automático de horas y reportes.',
        'Facturación electrónica: stored procedures para XML SUNAT, proceso 100% automatizado.',
      ],
    },
  ],
  skills: [
    {
      group: 'Datos & Base de Datos',
      icon: 'data',
      items: ['SQL Server / T-SQL avanzado', 'Stored procedures, triggers y funciones', 'Performance tuning', 'ETL: CSV, Excel, XML, JSON', 'Modelado y validación de datos'],
    },
    {
      group: 'IA & Automatización',
      icon: 'ai',
      items: ['Python: pandas, NumPy', 'APIs de IA: Groq, Tavily', 'Agentes con LLMs (LLaMA, Claude, GPT)', 'n8n y MCP', 'Desarrollo asistido por IA'],
    },
    {
      group: 'Desarrollo Web & Apps',
      icon: 'web',
      items: ['HTML5, CSS3, JavaScript', 'Firebase', 'Streamlit', 'Django', 'Dart / Flutter', 'Git / GitHub'],
    },
    {
      group: 'BI & Reporting',
      icon: 'bi',
      items: ['Power BI', 'Excel avanzado', 'SQL Server Management Studio', 'Visual Studio Code'],
    },
  ],
  certifications: [
    { name: 'n8n + MCP: Automatización y Agentes de IA', issuer: 'Udemy', year: '2026', url: '' },
    { name: 'Vibe Coding', issuer: 'Udemy', year: '2026', url: '' },
    { name: 'Ultimate Python', issuer: 'Udemy', year: '2025', url: '' },
    { name: 'Introducción a la Inteligencia Artificial', issuer: 'Platzi', year: '2025', url: '' },
    { name: 'Máster en SQL Server', issuer: 'Udemy', year: '2023', url: '' },
  ],
  education: [
    { title: 'Ingeniería de Ciencia de Datos e Inteligencia Artificial', institution: 'Cibertec', period: 'En curso' },
    { title: 'Técnico en Software y Sistemas', institution: 'Instituto Superior SISE', period: '2017 — 2020' },
  ],
};

// Agrega order y visible a cada elemento (para cargarlos en Firestore).
export function seedItems(col) {
  return (SEED[col] || []).map((item, i) => ({ ...item, order: i, visible: true }));
}
