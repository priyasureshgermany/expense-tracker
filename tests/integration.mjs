/*
 * INTEGRATION — the pieces together.
 *
 * What the screen says against the function it comes from, a figure against
 * the total it was derived from, the UI path a person actually takes, and a
 * backup going out and coming back. Most past bugs in this app lived between
 * two parts that were each right on their own.
 */
import assert from "node:assert/strict";

const cents = s => {
  /* "11.373,66 €" or "-133,32 €" → integer cents; compared as numbers, never as
     text, which carries a non-breaking space and, with the eye shut, a mask */
  const m = String(s).replace(/[^\d,.\-−]/g, "").replace("−", "-").replace(/\./g, "").replace(",", ".");
  return Math.round(parseFloat(m) * 100);
};

/* Two real bank layouts. Commerzbank signs one Betrag column; Deutsche Bank
   splits Soll and Haben, opens with a preamble, ends on a balance row, and
   arrives with its umlauts mangled by the cp1252 round trip. */
const COMMERZ = `Auszug;Buchungstag;Wertstellung;Umsatzart;Buchungstext;Betrag;Währung;Auftraggeberkonto;IBAN Auftraggeberkonto
1;03.08.2026;03.08.2026;Lastschrift;REWE SAGT DANKE 12345 FRANKFURT;-45,67;EUR;1234567;DE02...
1;04.08.2026;04.08.2026;Gutschrift;LOHN / GEHALT AUGUST ACME GMBH;3.204,55;EUR;1234567;DE02...
1;05.08.2026;05.08.2026;Lastschrift;NETFLIX INTERNATIONAL B.V.;-12,99;EUR;1234567;DE02...
1;06.08.2026;06.08.2026;Lastschrift;STADTWERKE FRANKFURT GAS ABSCHLAG;-98,00;EUR;1234567;DE02...
1;07.08.2026;07.08.2026;Dauerauftrag;MIETE WOHNUNG HAUSVERWALTUNG MUELLER;-1.180,00;EUR;1234567;DE02...`;
const DEUTSCHE = `"Umsatzübersicht"
"Kontonummer:";"1234567 / EUR"
""
"Buchungstag";"Wert";"Umsatzart";"Beg�nstigter / Auftraggeber";"Verwendungszweck";"IBAN";"BIC";"Soll";"Haben";"W�hrung"
"09.08.2026";"09.08.2026";"SEPA-Lastschrift";"EDEKA SUEDWEST";"EDEKA WEEKLY SHOP";"DE11";"XXX";"-89,15";"";"EUR"
"10.08.2026";"10.08.2026";"SEPA-Gutschrift";"FINANZAMT FRANKFURT";"STEUERERSTATTUNG 2025";"DE22";"XXX";"";"412,00";"EUR"
"11.08.2026";"11.08.2026";"SEPA-Lastschrift";"DEUTSCHE BAHN AG";"DEUTSCHLANDTICKET AUGUST";"DE33";"XXX";"-58,00";"";"EUR"
"Kontostand";"";"";"";"";"";"";"";"2.410,55";"EUR"`;

export default [
  { name: "balance card, balanceNow and the line's last point agree", async run(pg){
    const r = await pg.fn(async () => {
      __T.useBook();
      await new Promise(r => setTimeout(r, 1300));       /* the card counts up */
      const out = { card: document.querySelector("#balNow").textContent,
                    now: balanceNow().now,
                    line: balanceLinePoints().slice(-1)[0].v,
                    read: document.querySelector("#balLineVal").textContent };
      __T.restore();
      return out;
    });
    assert.equal(cents(r.card), r.now);
    assert.equal(r.line, r.now);
    assert.equal(cents(r.read), r.now);
  }},

  { name: "balance line: hidden by default, and Settings switches it on and off", async run(pg){
    const r = await pg.fn(async () => {
      __T.useBook();
      state.balLine = false; render();
      const byDefault = document.querySelector("#balLine").hidden;
      openSettings(); await new Promise(r => setTimeout(r, 250));
      document.querySelector('#cfgBalLine [data-v="on"]').click();
      const on = { hidden: document.querySelector("#balLine").hidden, flag: state.balLine,
                   pressed: document.querySelector('#cfgBalLine [data-v="on"]').getAttribute("aria-pressed") };
      document.querySelector('#cfgBalLine [data-v="off"]').click();
      const off = { hidden: document.querySelector("#balLine").hidden, flag: state.balLine };
      sheetClose();
      const kept = stateFromPayload(JSON.parse(JSON.stringify(Object.assign({}, state, { balLine:true })))).balLine;
      __T.restore();
      return { byDefault, on, off, kept };
    });
    assert.equal(r.byDefault, true);
    assert.deepEqual(r.on, { hidden:false, flag:true, pressed:"true" });
    assert.deepEqual(r.off, { hidden:true, flag:false });
    assert.equal(r.kept, true, "the setting survives a backup round trip");
  }},

  { name: "balance line: tapping a month reads that month out", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      document.querySelectorAll("#balLineChart .bl-hit")[3]
        .dispatchEvent(new MouseEvent("click", { bubbles:true }));
      const out = { read: document.querySelector("#balLineVal").textContent,
                    note: !document.querySelector("#balLineNote").hidden,
                    dashed: document.querySelectorAll("#balLineChart .bl-back").length,
                    curved: [...document.querySelectorAll("#balLineChart .bl-path, #balLineChart .bl-back")]
                      .every(p => /^M[^L]*C/.test(p.getAttribute("d"))) };
      __T.restore();
      return out;
    });
    assert.match(r.read, /June 2026/);
    assert.equal(cents(r.read.replace(/^.*2026/, "")), 500640);
    assert.equal(r.note, true);
    assert.ok(r.dashed > 0);
    assert.equal(r.curved, true, "the balance line is drawn as curves");
  }},

  { name: "adding an entry through the sheet moves the balance by exactly its amount", async run(pg){
    const r = await pg.fn(async () => {
      __T.useBook();
      const before = balanceNow().now;
      const n = state.txns.length;
      openEntry(null, "expense");
      await new Promise(r => setTimeout(r, 350));
      document.querySelector("#eAmt").value = "12,34";
      setDateVal("#eDate", "2026-10-14");
      document.querySelector("#eSave").click();
      await new Promise(r => setTimeout(r, 150));
      const added = state.txns.length - n;
      const moved = before - balanceNow().now;
      /* control: the same amount dated ahead is saved but moves nothing */
      const before2 = balanceNow().now;
      openEntry(null, "expense");
      await new Promise(r => setTimeout(r, 350));
      document.querySelector("#eAmt").value = "12,34";
      setDateVal("#eDate", "2027-01-15");
      document.querySelector("#eSave").click();
      await new Promise(r => setTimeout(r, 150));
      const out = { added, moved, ahead: before2 - balanceNow().now, total: state.txns.length - n };
      __T.restore();
      return out;
    });
    assert.equal(r.added, 1);
    assert.equal(r.moved, 1234);
    assert.equal(r.ahead, 0);
    assert.equal(r.total, 2);
  }},

  { name: "report: the five bars add up to what the rows in them add up to", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      repRange = "last12"; repKind = "all"; repCats = []; repAccts = [];
      const b = repBuckets();
      const from = b[0].from, to = b[b.length - 1].to;
      const rows = repRows().filter(t => t.date >= from && t.date <= to);
      const t = repTotals(rows);
      const out = { inc: b.reduce((n, x) => n + x.inc, 0), out: b.reduce((n, x) => n + x.out, 0),
                    tInc: t.inc, tOut: t.out, n: b.length };
      repRange = "month";
      __T.restore();
      return out;
    });
    assert.ok(r.n > 0);
    assert.equal(r.inc, r.tInc);
    assert.equal(r.out, r.tOut);
  }},

  { name: "report chart: the switch turns bars into lines and back, reading the same figures", async run(pg){
    const r = await pg.fn(async () => {
      __T.useBook();
      try{ localStorage.removeItem("panappai.repBarsLine"); }catch(e){}
      repBarsLine = false;
      openReport(); await new Promise(r => setTimeout(r, 300));
      const shape = () => ({ bars: document.querySelectorAll("#repBarsChart rect:not(.bx-hit)").length,
                             lines: document.querySelectorAll("#repBarsChart .bx-ln").length,
                             areas: document.querySelectorAll("#repBarsChart .bx-area").length,
                             curved: [...document.querySelectorAll("#repBarsChart .bx-ln")].every(p => /C/.test(p.getAttribute("d")) && !/L/.test(p.getAttribute("d"))),
                             hits: document.querySelectorAll("#repBarsChart .bx-hit").length,
                             label: document.querySelector("#repBarsMode").getAttribute("aria-label"),
                             read: document.querySelector("#repBarsVal").textContent });
      const asBars = shape();
      document.querySelector("#repBarsMode").click();
      const asLines = shape();
      const kept = localStorage.getItem("panappai.repBarsLine");
      /* a tapped column reads out the same in either shape */
      document.querySelectorAll("#repBarsChart .bx-hit")[1].dispatchEvent(new MouseEvent("click", { bubbles:true }));
      const lineRead = document.querySelector("#repBarsVal").textContent;
      document.querySelector("#repBarsMode").click();
      const barRead = document.querySelector("#repBarsVal").textContent;
      const back = shape();
      sheetClose();
      try{ localStorage.removeItem("panappai.repBarsLine"); }catch(e){}
      repBarsLine = false;
      __T.restore();
      return { asBars, asLines, kept, lineRead, barRead, back };
    });
    assert.ok(r.asBars.bars > 0); assert.equal(r.asBars.lines, 0);
    assert.equal(r.asBars.label, "Show as a line chart");
    assert.equal(r.asLines.bars, 0); assert.equal(r.asLines.lines, 2);
    assert.equal(r.asLines.areas, 2, "each line shades the area below it");
    assert.equal(r.asLines.curved, true, "the lines are curves, not straight segments");
    assert.equal(r.asBars.areas, 0);
    assert.equal(r.asLines.hits, r.asBars.hits);
    assert.equal(r.asLines.read, r.asBars.read);
    assert.equal(r.asLines.label, "Show as bars");
    assert.equal(r.kept, "1");
    assert.equal(r.lineRead, r.barRead);
    assert.equal(r.back.bars, r.asBars.bars); assert.equal(r.back.lines, 0);
  }},

  { name: "report: the Details table lists every counted row", async run(pg){
    const r = await pg.fn(async () => {
      __T.useBook();
      openReport();
      await new Promise(r => setTimeout(r, 300));
      repFold = {};
      document.querySelectorAll(".rp-grp").forEach(g => { if (g.classList.contains("shut")) g.click(); });
      const out = { rows: repRows().length,
                    drawn: document.querySelectorAll(".rp-table tbody tr:not(.rp-grp)").length };
      sheetClose();
      __T.restore();
      return out;
    });
    assert.ok(r.rows > 0);
    assert.equal(r.drawn, r.rows);
  }},

  { name: "bank import: both layouts through the paste box, then re-import finds every duplicate", async run(pg){
    const r = await pg.fn(async (commerz, deutsche) => {
      __T.useBook();
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const paste = async text => {
        document.querySelector("#btnImport").click();
        await wait(300);
        document.querySelector("#pasteCsv").value = text;
        document.querySelector("#parsePaste").click();
        await wait(200);
        return { rows: document.querySelectorAll("#impPrev .prow").length,
                 items: pending.items.map(i => i.date + " " + i.type + " " + i.amount + " " + i.category),
                 dupes: pending.items.filter(i => i.dupe).length,
                 picked: pending.items.filter(i => i.pick).length };
      };
      const n0 = state.txns.length;
      const cb = await paste(commerz);
      document.querySelector("#impCommit").click(); await wait(200);
      const db = await paste(deutsche);
      document.querySelector("#impCommit").click(); await wait(200);
      const added = state.txns.length - n0;
      const again = await paste(commerz);
      document.querySelector("#impBack").click();
      sheetClose();
      __T.restore();
      return { cb, db, added, again };
    }, COMMERZ, DEUTSCHE);
    assert.equal(r.cb.rows, 5);
    assert.deepEqual(r.cb.items.sort(), [
      "2026-08-03 expense 4567 groceries_de", "2026-08-04 income 320455 salary",
      "2026-08-05 expense 1299 subs", "2026-08-06 expense 9800 utilities",
      "2026-08-07 expense 118000 rent"]);
    assert.equal(r.db.rows, 3);
    assert.deepEqual(r.db.items.sort(), [
      "2026-08-09 expense 8915 groceries_de", "2026-08-10 income 41200 refund",
      "2026-08-11 expense 5800 transport"]);
    assert.equal(r.added, 8);
    assert.equal(r.again.dupes, 5);
    assert.equal(r.again.picked, 0);
  }},

  { name: "backup round trip: out as JSON, back through restore, nothing lost", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const out = JSON.stringify(state);
      const back = stateFromPayload(JSON.parse(out));
      const diff = Object.keys(JSON.parse(out)).filter(k =>
        JSON.stringify(JSON.parse(out)[k]) !== JSON.stringify(back[k]));
      __T.restore();
      return { diff, txns: back.txns.length, accts: back.accounts.map(a => a.start ? a.start.amount : null) };
    });
    assert.deepEqual(r.diff, []);
    assert.equal(r.txns, 50);
    assert.deepEqual(r.accts, [500000, 20000, null]);
  }},

  { name: "German: the dashboard has no English left in the new parts", async run(pg){
    await pg.eval('localStorage.setItem("panappai.lang", "de")');
    await pg.goto("/?de=" + Date.now());
    const r = await pg.fn(async () => {
      __T.useBook();
      document.querySelectorAll("#balLineChart .bl-hit")[2]
        .dispatchEvent(new MouseEvent("click", { bubbles:true }));
      await new Promise(r => setTimeout(r, 400));     /* the dictionary swaps on the next tick */
      openSettings(); await new Promise(r => setTimeout(r, 400));
      const row = document.querySelector("#cfgBalLine").closest(".cfgrow");
      repDrawBars(); await new Promise(r => setTimeout(r, 100));
      const sw = document.querySelector("#repBarsMode").getAttribute("aria-label");
      const out = { val: document.querySelector("#balLineVal").innerText,
                    note: document.querySelector("#balLineNote").innerText,
                    k: document.querySelector(".bal-k").innerText,
                    cfg: row.querySelector(".cf-t b").innerText,
                    btns: [...row.querySelectorAll("button")].map(b => b.innerText), sw };
      sheetClose();
      __T.restore();
      return out;
    });
    await pg.eval('localStorage.removeItem("panappai.lang")');
    await pg.goto("/?en=" + Date.now());
    assert.match(r.val, /^Ende Mai 2026/);
    assert.match(r.note, /^Gestrichelt/);
    assert.doesNotMatch(r.k, /account now/i);
    assert.equal(r.cfg, "Saldoverlauf");
    assert.deepEqual(r.btns, ["Aus", "An"]);
    assert.equal(r.sw, "Als Liniendiagramm zeigen");
  }}
];
