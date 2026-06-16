/*
Avidsphere CRM LocalStorage Exporter

Usage:
1. Open the running CRM frontend in your browser (the page that loads frontend/index.html).
2. Open Developer Tools → Console.
3. Paste the entire contents of this file into the Console and press Enter.
4. Confirm the prompt and a JSON file will download containing the exported keys.

This script is read-only and does not modify the application's data or behavior.

Notes:
- Do not run in a public/shared environment where sensitive data may be exposed.
- The file contains a timestamp, the page origin, URL, and each exported key's parsed JSON (or null).
*/

(function EXPORT_AVIDSPHERE_LOCALSTORAGE() {
  const KEYS = [
    'avidSphere.customers',
    'avidSphere.sales',
    'avidSphere.reminders',
    'avidSphere.notifications',
    'avidSphere.activities',
    'avidSphere.preferences',
    'avidSphere.notificationHistory'
  ];

  try {
    const proceed = window.confirm('Export Avidsphere CRM localStorage to JSON? This will download a file to your device.');
    if (!proceed) return null;

    const exported = {
      exportedAt: new Date().toISOString(),
      origin: location.origin || null,
      url: location.href || null,
      keys: {}
    };

    KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        exported.keys[key] = raw ? JSON.parse(raw) : null;
      } catch (err) {
        exported.keys[key] = { error: 'PARSE_ERROR', raw: localStorage.getItem(key) };
      }
    });

    const filename = `avidsphere-localstorage-export-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);

    console.log('[export-localstorage] Export complete. Keys:', Object.keys(exported.keys));
    return exported;
  } catch (err) {
    console.error('[export-localstorage] Unexpected error during export', err);
    throw err;
  }
})();

// End
