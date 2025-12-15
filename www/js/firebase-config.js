const firebaseConfig = {
  apiKey: "AIzaSyADcn4KhhNNYBnO8r7nk_mDKKvC92tlYNo",
  authDomain: "utask-911a0.firebaseapp.com",
  projectId: "utask-911a0",
  storageBucket: "utask-911a0.firebasestorage.app",
  messagingSenderId: "497805271216",
  appId: "1:497805271216:web:e50a41c6ce0fffb9e21b75"
};

if (!window.firebase) {
  console.error('Firebase SDK no cargado correctamente.');
} else {
  firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
  window.db = firebase.firestore();

  try {
    db.enablePersistence()
      .then(() => console.log('Persistencia Firestore habilitada'))
      .catch((err) => console.warn('Persistencia no habilitada:', err));
  } catch (e) {
    console.warn('enablePersistence no soportado en este entorno:', e);
  }
}

