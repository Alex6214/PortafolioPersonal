// Configuración web pública de Firebase (no es secreta: la seguridad la dan
// Authentication y las reglas de Firestore).
export const firebaseConfig = {
  apiKey: 'AIzaSyCW4anxzBHWNZxZhyagaOT9rbh37QawXNU',
  authDomain: 'portafolioalex-afb50.firebaseapp.com',
  projectId: 'portafolioalex-afb50',
  storageBucket: 'portafolioalex-afb50.firebasestorage.app',
  messagingSenderId: '375917315908',
  appId: '1:375917315908:web:3b444d9e8f03b9311a7911',
};

// Colecciones que forman el portafolio (el orden aquí no importa; cada
// elemento tiene su propio campo "order").
export const COLLECTIONS = ['projects', 'experience', 'skills', 'certifications', 'education'];
