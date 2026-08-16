# Demo "proyecto facil"

Demo independiente para presentar a clientes. App mobile-first de control de proyectos de terminaciones (puertas, ventanas, baños, closets) con Kanban y finanzas. Montos en pesos dominicanos (DOP).

No usa Firebase ni datos de ningún cliente real. Arranca vacía: tablero, finanzas y técnicos se crean en la demo.

- Demo: https://demo-proyecto-facil.vercel.app
- Repositorio: https://github.com/Themachine1914/demo-proyecto-facil

## Acceso de demostración

- Usuario: `demo@proyectofacil.com`
- Contraseña: `facil2026`

## Cómo correr

```bash
npm install
npm run dev
```

## Cómo adaptar esta plantilla

Checklist al crear un cliente nuevo desde esta base:

- [ ] Copiar el repo completo (sin `.git`, `node_modules/`, `dist/`)
- [ ] Renombrar el paquete en `package.json`
- [ ] Revisar y sustituir bloques `TEMPLATE: CLIENT-SPECIFIC`
- [ ] Reemplazar `src/assets/logo.png`, `public/logo.png`, favicon e iconos PWA
- [ ] Actualizar nombre en `index.html` y `public/manifest.webmanifest`
- [ ] Cambiar usuario/contraseña de demo en `src/lib/demoAuth.ts` si hace falta
- [ ] Ajustar branding (ver skill facil-app-branding) si el contrato pide colores del cliente
- [ ] Actualizar README (nombre cliente, descripción, demos)
- [ ] `npm install && npm run build`
