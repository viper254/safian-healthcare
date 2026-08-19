const { copyFileSync } = require("node:fs");
const path = require("node:path");

// The root manifest is the single editable source. This generated local copy is
// bundled so the desktop shell always opens the exact approved PWA release.
copyFileSync(path.join(__dirname, "..", "pwa-release.json"), path.join(__dirname, "pwa-release.json"));
