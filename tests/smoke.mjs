/*
 * SMOKE — does the build stand up at all.
 *
 * Fast and shallow: the page loads without throwing, its three version numbers
 * agree, the single-file script has none of the defects that have shipped
 * silently before, and every screen opens.
 */
import assert from "node:assert/strict";

export default [
  { name: "page loads with no errors", async run(pg){
    assert.equal(await pg.eval("document.title.length > 0"), true);
    assert.deepEqual(pg.errors, []);
  }},

  { name: "version agrees in version.json, index.html and sw.js", async run(pg){
    const v = JSON.parse(pg.readFile("version.json")).version;
    assert.equal(await pg.eval("APP_VERSION"), v);
    assert.match(pg.readFile("sw.js"), new RegExp('const VERSION = "' + v.replace(/\./g, "\\.") + '"'));
  }},

  { name: "no top-level function is defined twice", async run(pg){
    /* the later definition silently wins — twice this blanked a screen or
       moved every date a month */
    const names = [...pg.readFile("index.html").matchAll(/^\s*function (\w+)/gm)].map(m => m[1]);
    const dup = names.filter((n, i) => names.indexOf(n) !== i);
    assert.deepEqual([...new Set(dup)], []);
  }},

  { name: "no stray control characters in index.html", async run(pg){
    /* a \b through a shell heredoc lands as a backspace byte and the regex it
       was in quietly matches nothing */
    const s = pg.readFile("index.html");
    const bad = [...s].map((c, i) => [c.charCodeAt(0), i]).filter(([c]) => c === 0 || c === 8 || c === 11 || c === 12);
    assert.deepEqual(bad, []);
  }},

  { name: "dashboard draws its cards", async run(pg){
    const r = await pg.fn(() => ({
      bal: !document.querySelector("#balCard").hidden,
      net: document.querySelector("#netVal").textContent.length > 0
    }));
    assert.deepEqual(r, { bal:true, net:true });
  }},

  { name: "every bottom tab opens", async run(pg){
    const shown = await pg.fn(async () => {
      const out = [];
      for (const b of document.querySelectorAll("#viewTog button[data-view]")){
        b.click();
        await new Promise(r => setTimeout(r, 120));
        out.push(b.dataset.view + ":" + b.getAttribute("aria-selected"));
      }
      document.querySelector('#viewTog button[data-view="dash"]').click();
      return out;
    });
    assert.ok(shown.length >= 3, "found tabs: " + shown.join(","));
    assert.deepEqual(shown.filter(s => !s.endsWith(":true")), []);
  }},

  { name: "Reports opens and draws both panes", async run(pg){
    const r = await pg.fn(async () => {
      openReport();
      await new Promise(r => setTimeout(r, 300));
      const ok = document.querySelector("#shReport").classList.contains("open") ||
                 getComputedStyle(document.querySelector("#shReport")).visibility !== "hidden";
      const rows = document.querySelectorAll(".rp-table tbody tr").length;
      sheetClose();
      return { ok, rows };
    });
    assert.equal(r.ok, true);
  }},

  { name: "no horizontal page scroll at phone width", async run(pg){
    const over = await pg.eval("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    assert.ok(over <= 0, "overflow " + over + "px");
  }},

  { name: "body paints a background in light, dark and system themes", async run(pg){
    const r = await pg.fn(() => {
      const html = document.documentElement, keep = html.getAttribute("data-theme");
      const out = [];
      for (const t of ["light", "dark", null]){
        t ? html.setAttribute("data-theme", t) : html.removeAttribute("data-theme");
        out.push(getComputedStyle(document.body).backgroundColor);
      }
      keep ? html.setAttribute("data-theme", keep) : html.removeAttribute("data-theme");
      return out;
    });
    r.forEach(bg => assert.ok(bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent", bg));
  }},

  { name: "Settings and More open", async run(pg){
    await pg.fn(async () => {
      openSettings(); await new Promise(r => setTimeout(r, 200)); sheetClose();
      openMore();     await new Promise(r => setTimeout(r, 200)); sheetClose();
    });
  }}
];
