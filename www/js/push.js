window.initPush = function() {
  console.log('initPush invoked');

  const fbPlugin = window.FirebasePlugin || (window.cordova && cordova.plugins && cordova.plugins.firebase) || window.Firebase;
  if (!fbPlugin) {
    console.warn('Firebase nativo (plugin) no disponible. Ejecutando en modo Web-only.');
    return;
  }

  try {
    if (typeof fbPlugin.getToken === 'function') {
      fbPlugin.getToken(function(token){
        console.log("FCM token (nativo):", token);
        if (auth && auth.currentUser && auth.currentUser.uid) {
          try {
            db.collection('users').doc(auth.currentUser.uid).set({ fcmToken: token }, { merge: true });
          } catch(e) { console.warn('No se pudo guardar token en Firestore:', e); }
        }
      }, function(err){
        console.warn("No se obtuvo token FCM:", err);
      });
    }

    if (typeof fbPlugin.onMessageReceived === 'function') {
      fbPlugin.onMessageReceived(function(message) {
        console.log("Mensaje FCM recibido (nativo):", message);
        if (message && (message.title || message.body)) {
          try { alert((message.title || '') + '\n' + (message.body || '')); } catch(e) { console.log('Notificación recibida', message); }
        }
      }, function(err){
        console.warn("onMessageReceived error:", err);
      });
    }
  } catch (e) {
    console.error('initPush error:', e);
  }
};

