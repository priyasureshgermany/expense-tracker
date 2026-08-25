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
 * Every release also gets a line in RELEASES.md, which the app shows under
 * Settings → About. Notes are required: a release nobody can describe in one
 * line is one nobody will be able to identify later either.
 *
 * One bump covers a whole branch. When review turns up more work, add notes to
 * the version already prepared rather than cutting another one — a round of
 * feedback shouldn't consume a version number. The pre-commit hook compares
 * against what is released rather than against the previous commit, so that it
 * doesn't have to.
 *
 *   node tools/bump-version.mjs --note "What changed" [--note "And this"]
 *   node tools/bump-version.mjs --amend --note "Found in review"
 *   node tools/bump-version.mjs --dry                 print what would happen
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_FILE = join(root, "version.json");
const INDEX_FILE = join(root, "index.html");
const SW_FILE = join(root, "sw.js");
const NOTES_FILE = join(root, "RELEASES.md");

const argv = process.argv.slice(2);
const dry = argv.includes("--dry");
const amend = argv.includes("--amend");
const notes = argv.reduce((acc, a, i) => {
  if (a === "--note" && argv[i + 1]) acc.push(argv[i + 1].trim());
  return acc;
}, []).filter(Boolean);

const iso = (d) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

const today = new Date();
const todayISO = iso(today);
const isMonday = today.getDay() === 1;

const state = JSON.parse(readFileSync(VERSION_FILE, "utf8"));

/** The version currently on main, or "" when it can't be determined. */
function releasedVersion() {
  for (const ref of ["origin/main", "main"]) {
    try {
      const raw = execSync(`git show ${ref}:version.json`, {
        cwd: root, stdio: ["ignore", "pipe", "ignore"]
      }).toString();
      return String(JSON.parse(raw).version || "");
    } catch { /* no such ref, or not a checkout — try the next */ }
  }
  return "";
}

/* --amend leaves the number alone and files the notes under it, for when more
   work lands on a branch whose release was already prepared. */
if (amend) {
  if (!notes.length) {
    console.error(
      '--amend needs a note:\n' +
      '  node tools/bump-version.mjs --amend --note "What else changed"'
    );
    process.exit(1);
  }
  /* Refuse to touch a version that has already shipped: without this, --amend
     on a branch with nothing prepared silently rewrites the notes of the live
     release instead of the one being worked on. */
  if (state.version === releasedVersion()) {
    console.error(
      state.version + " is the released version — nothing is prepared on this branch yet.\n" +
      "Cut the release first:\n" +
      '  node tools/bump-version.mjs --note "What changed in one line"'
    );
    process.exit(1);
  }
  const src = readFileSync(NOTES_FILE, "utf8");
  const at = src.indexOf("## " + state.version + " —");
  if (at === -1) {
    console.error(
      "No section for " + state.version + " in RELEASES.md.\n" +
      "Nothing has been prepared on this branch yet — bump without --amend first."
    );
    process.exit(1);
  }
  /* append inside that section, before the next heading or the end of file */
  const nextAt = src.indexOf("\n## ", at + 1);
  const end = nextAt === -1 ? src.length : nextAt;
  const merged = src.slice(at, end).trimEnd() + "\n" +
    notes.map(n => "- " + n).join("\n");
  writeFileSync(NOTES_FILE, src.slice(0, at) + merged + "\n" + src.slice(end), "utf8");
  console.log("Added to " + state.version + " (version unchanged):");
  notes.forEach(n => console.log("  - " + n));
  process.exit(0);
}

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

if (!notes.length) {
  console.error(
    'A release needs at least one note:\n' +
    '  node tools/bump-version.mjs --note "What changed in one line"'
  );
  process.exit(1);
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

/* Newest first, inserted under the intro so the file stays appendable. */
const notesSrc = readFileSync(NOTES_FILE, "utf8");
const marker = notesSrc.indexOf("\n## ");
const entry =
  "## " + version + " — " + todayISO + "\n" +
  notes.map(n => "- " + n).join("\n") + "\n";
const updated = marker === -1
  ? notesSrc.trimEnd() + "\n\n" + entry
  : notesSrc.slice(0, marker + 1) + entry + "\n" + notesSrc.slice(marker + 1);
writeFileSync(NOTES_FILE, updated, "utf8");

writeFileSync(
  VERSION_FILE,
  JSON.stringify({ version, lastRelease: todayISO }, null, 2) + "\n",
  "utf8"
);

console.log(`${state.version} -> ${version}  (${reason})`);
notes.forEach(n => console.log("  - " + n));
