Descripción general

U-Task es una aplicación móvil híbrida desarrollada con Apache Cordova que permite la gestión colaborativa de tareas mediante operaciones CRUD (Crear, Leer, Actualizar y Eliminar), autenticación de usuarios y almacenamiento en la nube utilizando Firebase.

La aplicación está orientada a dispositivos Android, utiliza una arquitectura cliente–nube y cumple con buenas prácticas de seguridad en aplicaciones móviles, de acuerdo con los lineamientos académicos del proyecto integrador.

Objetivo del proyecto

Desarrollar una aplicación móvil funcional que:

- Implemente operaciones CRUD.
- Se conecte a un servicio en la nube.
- Incorpore autenticación de usuarios.
- Aplique principios básicos de seguridad.
- Sea evaluable mediante código fuente, APK y evidencias visuales.

Estructura del proyecto
utask/
├── config.xml
├── package.json
├── google-services.json (ignorado por seguridad)
├── www/
│   ├── index.html
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── firebase-config.js
│   │   ├── auth.js
│   │   ├── ui.js
│   │   ├── tasks-service.js
│   │   ├── push.js
│   │   └── index.js
├── platforms/
├── plugins/
└── README.md

Funcionalidades principales
Autenticación
- Registro de usuarios con correo y contraseña.
- Inicio y cierre de sesión.
- Creación automática del documento users/{uid} en Firestore.
- Gestión de tareas (CRUD)

Crear tareas con:
- Título
- Descripción
- Fecha límite
- Prioridad
- Asignación de usuarios
- Visualizar tareas en tiempo real.
- Editar estado y título.
- Eliminar tareas.
- Interfaz de usuario
- Pantalla de login.
- Lista de tareas.
- Modal para crear tareas.
- Perfil de usuario.
- Barra de navegación inferior.
Autor

Nombre del estudiante: Rivera García Leonardo y Renovato Butanda Axel Jaret
Asignatura: Soluciones de programación móvil
Institución: Universidad del Valle de México

Licencia

Proyecto desarrollado con fines académicos.
Uso libre para evaluación y aprendizaje.
