# Exporting Avidsphere CRM LocalStorage

This utility helps you export the important CRM localStorage keys to a JSON file for backup or migration.

What it exports:
- `avidSphere.customers`
- `avidSphere.sales`
- `avidSphere.reminders`
- `avidSphere.notifications`
- `avidSphere.activities`
- `avidSphere.preferences`
- `avidSphere.notificationHistory`

How to use (recommended):
1. Open the CRM frontend in your browser (the page that includes `frontend/index.html`).
2. Open Developer Tools → Console.
3. Open `tools/export-localstorage.js` in this repository, copy its contents, and paste into the Console.
4. Confirm the prompt. A file named like `avidsphere-localstorage-export-2026-06-15T12-00-00-000Z.json` will download.

Alternative (bookmarklet):
1. Open the file and build a bookmarklet by prepending `javascript:` and minifying the snippet, then save as a bookmark.
2. Load the CRM page and click the bookmark to run the exporter.

Security notes:
- The exporter is read-only and does not change application state.
- The exported JSON may contain sensitive PII (emails, phone numbers). Keep the file secure.

If you want, I can also add a Node/Puppeteer helper to run the export headlessly and save the file to disk.
