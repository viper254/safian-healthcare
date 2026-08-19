import { readFile } from "node:fs/promises";

const release = JSON.parse(await readFile(new URL("./pwa-release.json", import.meta.url)));
const androidActivity = await readFile(new URL("./android/app/src/main/java/com/safian/healthcare/MainActivity.kt", import.meta.url), "utf8");
const iosView = await readFile(new URL("./ios/SafianPWA/ContentView.swift", import.meta.url), "utf8");
const desktopMain = await readFile(new URL("./desktop/main.cjs", import.meta.url), "utf8");

if (!release.pwaUrl.startsWith("https://") || release.allowedHosts.length !== 1) throw new Error("Shells require one approved HTTPS PWA host.");
for (const [name, source] of Object.entries({ androidActivity, iosView })) {
  if (!source.includes("safian-healthcare.vercel.app")) throw new Error(`${name} is not connected to the canonical PWA release.`);
}
if (!desktopMain.includes("pwa-release.json")) throw new Error("desktopMain does not read the canonical PWA release manifest.");
console.log(`Verified ${release.applicationName} shells point to ${release.pwaUrl}.`);
