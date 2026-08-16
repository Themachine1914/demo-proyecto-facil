# Demo — Jhon Meléndez Terminaciones

Demo de presentación de la app mobile-first de control de proyectos de terminaciones (puertas, ventanas, baños, closets) con Kanban y finanzas en tiempo real. Montos en pesos dominicanos (DOP).

Copia de [Terminaciones Meléndez](https://github.com/Themachine1914/terminaciones-melendez) para mostrarla a distintos clientes. El logo actual es un placeholder (`TU LOGO AQUI`) listo para sustituir por la marca del cliente.

## Cómo correr

```bash
cp .env.example .env
npm install
npm run dev
```

Completa las variables `VITE_FIREBASE_*` en `.env` con un proyecto Firebase (Auth email/password + Firestore). Publica las reglas:

```bash
firebase deploy --only firestore:rules
```

Crea un usuario en Firebase Authentication (email y contraseña) para entrar a la app.

## Cómo adaptar esta plantilla

Checklist al crear un cliente nuevo desde esta base:

- [ ] Copiar el repo completo (sin `.git`, `.env`, `node_modules/`, `dist/`)
- [ ] Renombrar el paquete en `package.json`
- [ ] Revisar y sustituir bloques `TEMPLATE: CLIENT-SPECIFIC`
- [ ] Reemplazar `src/assets/logo.png`, `public/logo.png`, favicon e iconos PWA
- [ ] Actualizar nombre en `index.html` y `public/manifest.webmanifest`
- [ ] Actualizar `.env.example` y crear `.env` local (proyecto Firebase propio)
- [ ] Ajustar branding (ver skill facil-app-branding) si el contrato pide colores del cliente
- [ ] Actualizar README (nombre cliente, descripción, demos)
- [ ] `npm install && npm run build`
