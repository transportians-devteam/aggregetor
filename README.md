# Aggregator Portal Frontend

React 18, TypeScript, Vite, TanStack Query and Tailwind frontend for the Delhi Aggregator/DSP portal. The UI consumes the Java 17 backend under `/api/v1`; active routes do not use mock business data.

## Local run

1. Start PostgreSQL and the backend as described in `../backend/README.md`.
2. Copy `.env.example` to `.env` if a different API URL is required.
3. Run:

```powershell
npm install
npm run dev -- --port 5173
```

Open `http://localhost:5173`. The backend development profile allows this origin and listens on `http://localhost:8081`.

## Development accounts

The login screen exposes backend development login only in Vite development mode. Authority accounts are seeded by the backend:

| Role | Phone |
|---|---:|
| Officer | `9000000001` |
| Appellate officer | `9000000002` |
| Enforcement | `9000000003` |
| Administrator | `9000000004` |

Applicant registration creates an Aggregator or DSP account and submits the licence application with its mandatory documents. Production builds use OTP registration/login and do not expose the development login controls.

## Verification

```powershell
npm test
npm run lint
npm run build
```

Configure `VITE_API_URL` at build time for deployment. Do not deploy with the placeholder in `.env.production`.
