// SDK de Firebase (solo lo usa el panel /admin).
// Con ?emu en la URL en localhost se usan los emuladores locales.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
auth.languageCode = 'es';

const useEmulators = ['localhost', '127.0.0.1'].includes(location.hostname)
  && new URLSearchParams(location.search).has('emu');

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  console.info('[firebase] Usando emuladores locales');
}
