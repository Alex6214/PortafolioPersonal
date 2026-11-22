// La configuración web de Firebase NO se guarda en el repositorio.
// Firebase Hosting la publica automáticamente en /__/firebase/init.json
// (también el emulador: `firebase emulators:start --only hosting`).
let configPromise;

export function getFirebaseConfig() {
  configPromise ??= fetch('/__/firebase/init.json').then((res) => {
    if (!res.ok) throw new Error(`No se pudo leer la configuración de Firebase (${res.status})`);
    return res.json();
  });
  return configPromise;
}

// Colecciones que forman el portafolio (el orden aquí no importa; cada
// elemento tiene su propio campo "order").
export const COLLECTIONS = ['projects', 'experience', 'skills', 'certifications', 'education'];
