document.addEventListener('DOMContentLoaded', () => {

  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');

  btnRegister.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Ingresa correo y contraseña');
      return;
    }

    try {

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const displayName = email.split('@')[0];

      await user.updateProfile({
        displayName: displayName
      });

      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: 'user',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert('Usuario registrado correctamente');

    } catch (error) {
      console.error('Error registro:', error);
      alert('Error registro: ' + error.message);
    }
  });

  btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Ingresa correo y contraseña');
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);

    } catch (error) {
      console.error('Error login:', error);
      alert('Error login: ' + error.message);
    }
  });

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('Usuario autenticado:', user.email);
      if (typeof tasksStartListener === 'function') {
        tasksStartListener(user.uid);
      }
    } else {
      console.log('Usuario no autenticado');
      if (typeof tasksStopListener === 'function') {
        tasksStopListener();
      }
    }
  });

});

