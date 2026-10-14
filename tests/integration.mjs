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

  { name: "balance line: tapping a month reads that month out", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      document.querySelectorAll("#balLineChart .bl-hit")[3]
        .dispatchEvent(new MouseEvent("click", { bubbles:true }));
      const out = { read: document.querySelector("#balLineVal").textContent,
                    note: !document.querySelector("#balLineNote").hidden,
                    dashed: document.querySelectorAll("#balLineChart .bl-back").length };
      __T.restore();
      return out;
    });
    assert.match(r.read, /June 2026/);
    assert.equal(cents(r.read.replace(/^.*2026/, "")), 500640);
    assert.equal(r.note, true);
    assert.ok(r.dashed > 0);
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
      const out = { val: document.querySelector("#balLineVal").innerText,
                    note: document.querySelector("#balLineNote").innerText,
                    k: document.querySelector(".bal-k").innerText };
      __T.restore();
      return out;
    });
    await pg.eval('localStorage.removeItem("panappai.lang")');
    await pg.goto("/?en=" + Date.now());
    assert.match(r.val, /^Ende Mai 2026/);
    assert.match(r.note, /^Gestrichelt/);
    assert.doesNotMatch(r.k, /account now/i);
  }}
];
