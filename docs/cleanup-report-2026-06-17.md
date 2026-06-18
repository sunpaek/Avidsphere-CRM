# Repository Cleanup Report

Date: June 17, 2026

## A. Files moved

- Legacy frontend files moved from `frontend/` to `archive/legacy-crm/`.
- Legacy assets moved from `frontend/Assets/` to `archive/legacy-crm/Assets/`.
- React/Vite diagnostic logs moved to `archive/migration-artifacts/logs/react-vite/`.
- Temporary Vite logs moved from `tmp/` to `archive/migration-artifacts/logs/tmp/`.
- Empty `app/` prototype moved to `archive/prototypes/app/`.
- Personal note moved to `archive/notes/`.
- Notification parity notes moved to `docs/migration/`.
- Notification implementation documents moved to `docs/notifications/`.
- Notification verification script moved to `archive/migration-artifacts/verification/` after it was confirmed to contain obsolete migration-era assertions.
- Original UTF-16 `.gitignore` preserved at `archive/migration-artifacts/gitignore.utf16.backup` before UTF-8 normalization.

## B. Files archived

The complete legacy CRM was archived without deleting its HTML, JavaScript, CSS, logo, Base64 logo data, or supporting asset script.

Migration logs and the empty prototype folder were archived rather than deleted.

## C. Recommended for deletion after review

- Local `.venv/` if no Python-based tooling depends on it.
- `archive/migration-artifacts/logs/` after the migration evidence is no longer useful.
- Local generated `frontend/react-app/dist/`; it can be recreated with `npm run build`.
- Local `node_modules/` directories when disk cleanup is desired; they can be recreated with `npm install`.
- Root `package.json` and `package-lock.json` if the repository does not adopt npm workspaces or root-level scripts.
- Unreachable React components listed in `docs/migration-notes.md`, but only after parity and visual review.

## D. Dependency audit

No clearly unused declared packages were found in either active package.

Frontend dependencies are referenced by source or build configuration. Backend dependencies are referenced by the Express/Resend implementation.

The root package is an unused scaffold rather than a duplicate dependency installation.

## E. Resulting structure

```text
.
├── archive/
│   ├── legacy-crm/
│   ├── migration-artifacts/
│   ├── notes/
│   └── prototypes/
├── backend/
├── docs/
│   ├── backend/
│   ├── database/
│   ├── deployment/
│   ├── migration/
│   ├── notifications/
│   ├── product/
│   ├── screenshots/
│   ├── architecture.md
│   └── migration-notes.md
├── frontend/
│   └── react-app/
├── tools/
├── README.md
└── .gitignore
```

## F. Risks and manual review

- Existing uncommitted notification/database work was preserved and reorganized.
- The legacy `frontend/script.js` had local modifications before cleanup; its archived version includes those modifications.
- The requested `docs/Avidsphere CRM Platform.pdf` was not present in the repository and was not fabricated.
- `node_modules` and `dist` had been committed historically. They are now ignored and removed from Git tracking while local copies remain available.
- The archived notification verification script reports false negatives against the current implementation and should not be used as a release gate without being rewritten.
- The production build emits a large-chunk warning; route-level code splitting is a future optimization, not a cleanup blocker.
- There is no automated test suite. Verification currently consists of TypeScript checks and a production build.
