# AvidSphere CRM React Frontend

This directory contains the active AvidSphere CRM application and is the frontend source of truth.

```powershell
npm install
npm run dev
```

The Vite development server runs at `http://127.0.0.1:5173`. The app stores current MVP data in browser `localStorage`, generates agreement PDFs in the browser, and calls the backend email API at `http://localhost:3000` by default.

Set `VITE_API_BASE` in a local environment file when the backend is hosted elsewhere.

Useful commands:

```powershell
npm run build
npm run preview
```

The pre-React CRM is preserved under `../../archive/legacy-crm/` as a parity and historical reference.
