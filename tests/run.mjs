#!/usr/bin/env node
/*
 * Three levels of tests, run against the real page in a real browser.
 *
 *   node tests/run.mjs                 all three, in order
 *   node tests/run.mjs smoke           only one level (smoke | unit | integration)
 *   node tests/run.mjs --headed        watch it happen
 *
 *   smoke        does it load, draw every screen and agree with itself on its
 *                version, with nothing thrown on the way
 *   unit         single functions, with inputs chosen to hit the edges and
 *                answers worked out by hand rather than read back from the code
 *   integration  modules together: a figure on screen against the function it
 *                comes from, the UI path for adding an entry, a backup round
 *                trip, the German dictionary over a new screen
 *
 * No dependencies. The page is a single file and the app has no build, so the
 * runner serves the folder itself and drives Chrome (or Edge) over the
 * DevTools protocol with Node's own WebSocket. Every run gets a fresh browser
 * profile, which matters here: the service worker pins the page it first
 * served, and a reused profile tests yesterday's build without saying so.
 */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const HEADED = args.includes("--headed");
const LEVELS = ["smoke", "unit", "integration"];
const wanted = args.filter(a => LEVELS.includes(a));
const levels = wanted.length ? wanted : LEVELS;

/* ---------- a static server for the repo ---------- */
const TYPES = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".mjs":"text/javascript",
  ".json":"application/json", ".webmanifest":"application/manifest+json", ".png":"image/png",
  ".svg":"image/svg+xml", ".css":"text/css", ".ico":"image/x-icon" };
function serve(){
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream",
                         "Cache-Control": "no-store" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r(srv)));
}

/* ---------- the browser ---------- */
function findBrowser(){
  const c = [process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
  const hit = c.find(p => fs.existsSync(p));
  if (!hit) throw new Error("No Chrome or Edge found — set CHROME_PATH");
  return hit;
}

async function launch(){
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "panappai-test-"));
  const proc = spawn(findBrowser(), [
    HEADED ? "" : "--headless=new", "--remote-debugging-port=0", "--user-data-dir=" + profile,
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--window-size=420,900", "about:blank"
  ].filter(Boolean), { stdio:["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = "";
    const t = setTimeout(() => rej(new Error("browser did not start")), 20000);
    proc.stderr.on("data", d => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m){ clearTimeout(t); res(m[1]); }
    });
  });
  const close = () => {
    try{ proc.kill(); }catch(e){}
    setTimeout(() => { try{ fs.rmSync(profile, { recursive:true, force:true }); }catch(e){} }, 800);
  };
  return { wsUrl, close };
}

/* ---------- a very small DevTools protocol client ---------- */
function cdp(wsUrl){
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const waiting = new Map(), listeners = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && waiting.has(m.id)){
      const w = waiting.get(m.id); waiting.delete(m.id);
      m.error ? w.rej(new Error(m.error.message)) : w.res(m.result);
    } else if (m.method) listeners.forEach(l => l(m));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const n = ++id;
    waiting.set(n, { res, rej });
    ws.send(JSON.stringify({ id:n, method, params, sessionId }));
  });
  return new Promise(r => ws.onopen = () => r({ send, on: f => listeners.push(f), close: () => ws.close() }));
}

async function openPage(client, base){
  const { targetId } = await client.send("Target.createTarget", { url:"about:blank" });
  const { sessionId } = await client.send("Target.attachToTarget", { targetId, flatten:true });
  const s = (m, p) => client.send(m, p, sessionId);
  const errors = [];
  client.on(m => {
    if (m.sessionId !== sessionId) return;
    if (m.method === "Runtime.exceptionThrown"){
      const d = m.params.exceptionDetails;
      errors.push((d.exception && d.exception.description) || d.text);
    }
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      errors.push("console.error: " + m.params.args.map(a => a.value ?? a.description).join(" "));
  });
  await s("Runtime.enable"); await s("Page.enable");
  await s("Emulation.setTimezoneOverride", { timezoneId:"Europe/Berlin" });
  await s("Emulation.setDeviceMetricsOverride", { width:390, height:844, deviceScaleFactor:1, mobile:true });

  const page = {
    errors, base,
    /** Evaluate an expression in the page; promises are awaited. */
    async eval(expr){
      const r = await s("Runtime.evaluate", { expression:expr, awaitPromise:true, returnByValue:true });
      if (r.exceptionDetails){
        const d = r.exceptionDetails;
        throw new Error((d.exception && d.exception.description) || d.text);
      }
      return r.result.value;
    },
    /** Run a function in the page with JSON-able arguments. */
    fn(f, ...a){ return page.eval("(" + f.toString() + ")(..." + JSON.stringify(a) + ")"); },
    async goto(url){
      await s("Page.navigate", { url: base + url });
      const t0 = Date.now();
      const fixture = fs.readFileSync(path.join(ROOT, "tests", "fixture.js"), "utf8");
      /* loaded, and the fixture in place — retried, since a reload can land
         between the two and take the fixture with it */
      for (;;){
        try{
          if (await page.eval('document.readyState === "complete" && typeof render === "function"')){
            await page.eval(fixture);
            if (await page.eval('typeof __T === "object"')) break;
          }
        }catch(e){ /* mid-navigation */ }
        if (Date.now() - t0 > 20000) throw new Error("page did not load: " + url);
        await new Promise(r => setTimeout(r, 100));
      }
    },
    readFile: f => fs.readFileSync(path.join(ROOT, f), "utf8")
  };
  return page;
}

/* ---------- running ---------- */
const srv = await serve();
const base = "http://127.0.0.1:" + srv.address().port;
const br = await launch();
const client = await cdp(br.wsUrl);
const page = await openPage(client, base);
await page.goto("/?test=" + Date.now());
/* A first visit installs the service worker, and the app reloads once when it
   takes over. Let that happen before any test, or it lands in the middle of one. */
for (const t0 = Date.now(); Date.now() - t0 < 10000;){
  try{ if (await page.eval("!!navigator.serviceWorker.controller")) break; }catch(e){}
  await new Promise(r => setTimeout(r, 200));
}
await new Promise(r => setTimeout(r, 500));
await page.goto("/?test=" + Date.now());

let pass = 0, fail = 0;
const failures = [];
for (const level of levels){
  const { default: tests } = await import("./" + level + ".mjs");
  console.log("\n" + level.toUpperCase() + "  (" + tests.length + ")");
  for (const t of tests){
    const before = page.errors.length;
    try{
      await t.run(page);
      /* anything thrown inside the page while the test ran fails it too */
      if (page.errors.length > before) throw new Error("page errors: " + page.errors.slice(before).join(" | "));
      pass++; console.log("  \u2713 " + t.name);
    }catch(e){
      fail++; failures.push(level + " › " + t.name + "\n      " + String(e.message || e).split("\n")[0]);
      console.log("  \u2717 " + t.name + "\n      " + String(e.message || e).split("\n").slice(0, 12).join("\n      "));
      /* leave the next test a clean page */
      try{ await page.goto("/?test=" + Date.now()); }catch(e2){}
    }
  }
}
client.close(); br.close(); srv.close();
console.log("\n" + pass + " passed, " + fail + " failed" + (fail ? "\n\n" + failures.join("\n") : ""));
process.exit(fail ? 1 : 0);
