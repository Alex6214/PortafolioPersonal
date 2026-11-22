# Portafolio — Alexander Guevara Morán

Portafolio personal dinámico con panel administrativo privado.

- **Sitio público:** https://alexanderguevara.web.app
- **Panel:** https://alexanderguevara.web.app/admin (solo el administrador)

## Tecnologías

- HTML5, CSS3 y JavaScript (módulos nativos, sin framework ni bundler).
- Firebase **Hosting**, **Authentication** (Google) y **Cloud Firestore**, plan Spark (gratuito).
- Imágenes alojadas en **Cloudinary**: en el panel solo se pega el link. El sitio agrega
  automáticamente `f_auto,q_auto,c_limit,w_…` para servir WebP/AVIF del tamaño justo.

## Cómo funciona

| Parte | Detalle |
|---|---|
| Sitio público (`public/index.html`) | Lee Firestore con la API REST (sin cargar el SDK, abre más rápido). Si la base está vacía, muestra el contenido del CV (`js/seed.js`). |
| Panel (`public/admin/`) | Login con Google. Editas perfil, proyectos, experiencia, habilidades, certificaciones, formación y lees los mensajes del formulario. |
| Seguridad (`firestore.rules`) | Todos pueden leer el contenido. Solo escribe quien tenga un documento `admins/{UID}`, que se crea a mano en la consola. El formulario de contacto solo puede crear mensajes con campos y tamaños validados. |

### Modelo de datos

```
settings/profile        nombre, titular, sobre mí, foto, CV, redes, cifras
projects/{id}           title, summary, highlights[], tags[], imageUrl, liveUrl, repoUrl, featured, visible, order
experience/{id}         company, role, period, bullets[], visible, order
skills/{id}             group, icon, items[], visible, order
certifications/{id}     name, issuer, year, url, visible, order
education/{id}          title, institution, period, visible, order
messages/{id}           name, email, message, createdAt, read     (formulario de contacto)
admins/{uid}            quién puede editar (se crea en la consola)
```

## Estructura

```
public/
  index.html          Portafolio
  admin/index.html    Panel administrativo
  css/site.css        Estilos del portafolio (claro/oscuro, responsive)
  css/admin.css       Estilos del panel
  js/config.js        Configuración web de Firebase (pública, no es secreta)
  js/content.js       Lectura REST de Firestore + envío del formulario de contacto
  js/site.js          Dibuja el portafolio
  js/seed.js          Contenido inicial tomado del CV
  js/schema.js        Campos de cada formulario del panel
  js/admin.js         Lógica del panel
  js/firebase.js      SDK de Firebase (solo para el panel)
  js/util.js          Escape de HTML, validación de links y optimización de Cloudinary
firestore.rules       Reglas de seguridad
firebase.json         Hosting + cabeceras de seguridad (CSP)
```

## Configuración inicial (una sola vez)

1. **Firestore:** consola de Firebase → *Firestore Database* → *Crear base de datos* →
   modo producción → ubicación `southamerica-east1`.
2. **Login con Google:** *Authentication* → *Comenzar* → *Sign-in method* → *Google* → activar.
3. Publicar reglas: `firebase deploy --only firestore:rules`
4. Entra a `/admin`, ingresa con Google. Verás tu **UID**.
5. En Firestore crea la colección `admins` con un documento cuyo **ID** sea tu UID
   (campo `rol` = `owner`). Recarga `/admin`.
6. En *Perfil* pulsa **Cargar contenido inicial** para pasar tu CV a la base de datos.

## Uso diario

- **Cambiar una imagen:** súbela a Cloudinary, copia el link (`https://res.cloudinary.com/...`)
  y pégalo en el campo de imagen. Verás la vista previa al instante.
- **Ordenar:** flechas ↑ ↓ en cada lista. **Ocultar sin borrar:** ícono del ojo.
- **Destacado:** los proyectos destacados salen primero y en tarjeta grande.

## Comandos

Probar en local (http://localhost:5173):

```bash
python3 -m http.server 5173 --directory public
```

Publicar:

```bash
firebase deploy --only hosting,firestore:rules   # publica en alexanderguevara.web.app y portafolioalex-afb50.web.app
```

## Seguridad

- `js/config.js` no es secreto; la protección la dan Authentication y las reglas.
- Recomendado: en Google Cloud → *APIs y servicios* → *Credenciales*, restringe la *Browser key*
  a `localhost`, `alexanderguevara.web.app`, `portafolioalex-afb50.web.app` y `portafolioalex-afb50.firebaseapp.com`.
- Nunca subas `.env`, contraseñas ni claves de servicio (`.gitignore` ya los excluye).
