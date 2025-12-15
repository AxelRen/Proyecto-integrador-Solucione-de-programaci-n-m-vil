(function() {
  document.addEventListener('deviceready', onDeviceReady, false);

  function onDeviceReady() {
    console.log('Cordova deviceready fired');

    try {
      if (navigator.splashscreen && navigator.splashscreen.hide) {
        navigator.splashscreen.hide();
      }
    } catch(e) {
      console.warn('No splashscreen disponible o fallo al ocultarlo', e);
    }

    try {
      const permsPlugin = (window.cordova && cordova.plugins && cordova.plugins.permissions) ? cordova.plugins.permissions : null;
      if (permsPlugin) {
        const POST_NOTIFICATIONS = permsPlugin.PERMISSION_POST_NOTIFICATIONS || 'POST_NOTIFICATIONS';
        permsPlugin.hasPermission(POST_NOTIFICATIONS, function(status) {
          if (!status.hasPermission) {
            permsPlugin.requestPermission(POST_NOTIFICATIONS, function() {
              console.log('Permiso POST_NOTIFICATIONS concedido');
            }, function() {
              console.warn('Permiso POST_NOTIFICATIONS denegado o falló la petición');
            });
          }
        }, function(err) {
          console.warn('Error comprobando permiso POST_NOTIFICATIONS:', err);
        });
      }
    } catch(e) {
      console.warn('Error manejando permisos de notificación:', e);
    }

    try {
      if (window.initPush && typeof window.initPush === 'function') {
        window.initPush();
      } else {
        console.log('initPush no definido (modo navegador o script no cargado aún)');
      }
    } catch (e) {
      console.warn('initPush threw:', e);
    }

    try {
      if (window.StatusBar && StatusBar.styleDefault) {
        StatusBar.styleDefault();
      }
    } catch(e) {}
  }
})();

