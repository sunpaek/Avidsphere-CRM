# Migration Notes

## Current migration state

The React application has replaced the original plain HTML/CSS/JavaScript CRM as the active frontend. The legacy implementation is retained at `archive/legacy-crm/` because it remains useful for workflow parity, historical behavior, and regression comparison.

## Preserved legacy material

- `archive/legacy-crm/index.html`
- `archive/legacy-crm/script.js`
- `archive/legacy-crm/style.css`
- `archive/legacy-crm/Assets/`

The active React app now owns its required logo at `frontend/react-app/src/assets/logo.png`; it no longer imports runtime assets from the archived application.

## Migration-era artifacts

Vite diagnostic logs and temporary server output were moved to `archive/migration-artifacts/logs/`. These logs are not part of the active application and may be deleted after manual review.

The empty `app/` prototype structure was moved to `archive/prototypes/app/`.

The notification verification script was moved to `archive/migration-artifacts/verification/`. Its checks describe an earlier implementation shape and currently produce false negatives, so it is preserved only as migration history.

## React review notes

The following source files are not currently reachable from the `main.tsx` import graph:

- `components/AgreementActions.tsx`
- `components/CalendarMonthView.tsx`
- `components/NotificationCenter.tsx`
- `components/ReminderCard.tsx`
- `components/ReminderForm.tsx`
- `components/ui.tsx`

They were intentionally retained. Agreement, reminder, and notification parity work is still relevant, and filename-level reachability alone is not enough evidence for deletion.

No CSS rules were removed. The app uses dynamic and workflow-driven class names, so CSS pruning requires browser-level coverage or a dedicated visual regression pass.

## Dependency review

All declared frontend runtime dependencies are directly used:

- `react`
- `react-dom`
- `react-router-dom`
- `jspdf`

All declared backend dependencies are directly used:

- `cors`
- `dotenv`
- `express`
- `resend`

The root `package.json` and root `package-lock.json` do not currently coordinate the frontend and backend. They should either become an intentional npm workspace/root script entry point or be archived in a later reviewed change.
