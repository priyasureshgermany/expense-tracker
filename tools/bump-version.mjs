#!/usr/bin/env node
/**
 * Version bump for பணப்பை, run once per release.
 *
 *   MAJOR  first release in a new calendar month
 *   MIDDLE first release made on a Monday
 *   MINOR  every other release
 *
 * The higher rule wins and resets everything below it, so a Monday that also
 * opens a new month bumps MAJOR only. version.json carries the date of the
 * last release, which is what makes "first of the month" and "first on a
 * Monday" decidable without inspecting git history.
 *
 *   node tools/bump-version.mjs          bump and write
 *   node tools/bump-version.mjs --dry    print what would happen
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_FILE = join(root, "version.json");
const INDEX_FILE = join(root, "index.html");
const SW_FILE = join(root, "sw.js");

const dry = process.argv.includes("--dry");

const iso = (d) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

const today = new Date();
const todayISO = iso(today);
const isMonday = today.getDay() === 1;

const state = JSON.parse(readFileSync(VERSION_FILE, "utf8"));
const [major, middle, minor] = String(state.version).split(".").map(Number);
const last = state.lastRelease || "";

const newMonth = last && last.slice(0, 7) !== todayISO.slice(0, 7);
const firstToday = last !== todayISO;

let next, reason;
if (!last) {
  /* Nothing released yet: 1.0.0 is the starting point, not something to bump past. */
  next = [major, middle, minor];
  reason = "initial release";
} else if (newMonth) {
  next = [major + 1, 0, 0];
  reason = "first release of " + todayISO.slice(0, 7);
} else if (isMonday && firstToday) {
  next = [major, middle + 1, 0];
  reason = "first release this Monday";
} else {
  next = [major, middle, minor + 1];
  reason = "routine release";
}

const version = next.join(".");

if (dry) {
  console.log(`${state.version} -> ${version}  (${reason})`);
  process.exit(0);
}

/** Replaces exactly one occurrence, and fails loudly rather than silently no-op. */
function patch(file, pattern, replacement) {
  const src = readFileSync(file, "utf8");
  if (!pattern.test(src)) throw new Error(`pattern not found in ${file}: ${pattern}`);
  writeFileSync(file, src.replace(pattern, replacement), "utf8");
}

patch(INDEX_FILE, /const APP_VERSION = "[^"]*"/, `const APP_VERSION = "${version}"`);
patch(INDEX_FILE, /const APP_BUILT = "[^"]*"/, `const APP_BUILT = "${todayISO}"`);
/* the service worker cache name doubles as the release marker, so a new
   version always invalidates the old cache */
patch(SW_FILE, /const VERSION = "[^"]*"/, `const VERSION = "${version}"`);

writeFileSync(
  VERSION_FILE,
  JSON.stringify({ version, lastRelease: todayISO }, null, 2) + "\n",
  "utf8"
);

console.log(`${state.version} -> ${version}  (${reason})`);
