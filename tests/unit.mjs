/*
 * UNIT — one function at a time.
 *
 * Every expected value here was worked out by hand or comes from an outside
 * reference (the ISO calendar), never by running the function and copying what
 * it said. A test that agrees with the code by construction proves nothing.
 */
import assert from "node:assert/strict";

export default [
  { name: "parseAmount reads German and English amounts", async run(pg){
    const r = await pg.fn(() => ["1.234,56", "1,234.56", "12,5", "12", "-3,00", "(4,20)", "", "abc", "0,07"]
      .map(parseAmount));
    assert.deepEqual(r, [123456, 123456, 1250, 1200, -300, -420, null, null, 7]);
  }},

  { name: "isoOf takes a one-based month", async run(pg){
    /* a zero-based copy once shadowed it and moved every date a month ahead */
    assert.equal(await pg.eval('isoOf(2026, 1, 5)'), "2026-01-05");
    assert.equal(await pg.eval('isoOf(2026, 12, 31)'), "2026-12-31");
  }},

  { name: "addDays crosses months, years and leap days", async run(pg){
    const r = await pg.fn(() => [addDays("2026-01-31", 1), addDays("2026-12-31", 1),
                                 addDays("2028-02-28", 1), addDays("2026-03-01", -1)]);
    assert.deepEqual(r, ["2026-02-01", "2027-01-01", "2028-02-29", "2026-02-28"]);
  }},

  { name: "isoWeekNo matches the ISO calendar, year ends included", async run(pg){
    /* from the printed ISO calendar: 2020 and 2026 are 53-week years */
    const r = await pg.fn(() => ["2026-08-15", "2026-01-01", "2027-01-01", "2024-12-30", "2021-01-03", "2026-12-31"]
      .map(isoWeekNo));
    assert.deepEqual(r, [33, 1, 53, 1, 53, 53]);
  }},

  { name: "periodOf puts the 15th in its own period, the 14th in the one before", async run(pg){
    const r = await pg.fn(() => [periodOf("2026-10-15"), periodOf("2026-10-14"), periodOf("2026-01-03")]);
    assert.deepEqual(r, ["2026-10", "2026-09", "2025-12"]);
  }},

  { name: "acctDelta: income, expense, both legs of a transfer", async run(pg){
    const r = await pg.fn(() => {
      const inc = { type:"income", amount:500, account:"a" };
      const exp = { type:"expense", amount:200, account:"a" };
      const xfer = { type:"transfer", amount:70, account:"b", fromAccount:"a" };
      const bankIn = { type:"income", amount:90, account:"b", fromAccount:"a" };
      return [acctDelta(inc, "a"), acctDelta(exp, "a"), acctDelta(xfer, "a"), acctDelta(xfer, "b"),
              acctDelta(bankIn, "a"), acctDelta(bankIn, "b"), acctDelta(exp, "z")];
    });
    assert.deepEqual(r, [500, -200, -70, 70, -90, 90, 0]);
  }},

  { name: "accountLedger leaves out planned, future and pre-snapshot entries", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const l = accountLedger("a1");
      const out = { start:l.start, total:l.total,
        dates:[...new Set(l.rows.map(x => x.t.date))].filter(d => d < "2026-06-15" || d > "2026-10-14").length };
      __T.restore();
      return out;
    });
    /* Giro from 5.000,00 on 15 Jun: −200 (20 Jun) + 3×(3.200 − 1.180 − 200) + 3.200 − 1.180 */
    assert.equal(r.start, 500000);
    assert.equal(r.total, 500000 - 20000 + 3 * 182000 + 320000 - 118000);
    assert.equal(r.dates, 0);
  }},

  { name: "balanceAt forward, back and today, worked by hand", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const out = ["2026-10-14", "2026-06-30", "2026-03-31", "2026-12-31"].map(d => balanceAt(d));
      __T.restore();
      return out;
    });
    /* today: Giro 12.280,00 + Cash −633,09 + PayPal −139,93 + loose −133,32 */
    assert.equal(r[0].v, 1137366); assert.equal(r[0].back, false);
    /* end of June: Giro 4.800 + Cash 319,69 (worked back) − PayPal 79,96 − loose 33,33 */
    assert.equal(r[1].v, 500640);  assert.equal(r[1].back, true);
    /* end of March: everything but PayPal worked back */
    assert.equal(r[2].v, -20859);  assert.equal(r[2].back, true);
    /* a date after today is today: nothing ahead has moved money */
    assert.equal(r[3].v, 1137366);
  }},

  { name: "balanceLinePoints: month-ends, today last, at most twelve", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const p = balanceLinePoints();
      __T.restore();
      return p.map(x => x.iso);
    });
    assert.deepEqual(r, ["2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30",
                         "2026-07-31", "2026-08-31", "2026-09-30", "2026-10-14"]);
  }},

  { name: "repTotals keeps planned apart and transfers out of the totals", async run(pg){
    const r = await pg.fn(() => {
      const keep = repAccts; repAccts = [];
      const t = repTotals([
        { type:"income", amount:1000, status:"done" },
        { type:"expense", amount:300, status:"done" },
        { type:"expense", amount:50, status:"planned" },
        { type:"transfer", amount:999, status:"done", account:"a", fromAccount:"b" }
      ]);
      repAccts = keep;
      return t;
    });
    assert.deepEqual(r, { inc:1000, out:350, net:650, plannedIn:0, plannedOut:50, settledIn:1000, settledOut:300 });
  }},

  { name: "repNiceMax rounds up to a printable scale", async run(pg){
    const r = await pg.fn(() => [183, 550, 1001, 0].map(repNiceMax));
    assert.deepEqual(r, [200, 600, 1200, 1]);
  }},

  { name: "CSV cells: quoting and German decimal commas", async run(pg){
    const r = await pg.fn(() => [csvCell('a;b'), csvCell('say "hi"'), csvCell("plain"), csvAmount(123456), csvAmount(5)]);
    assert.deepEqual(r, ['"a;b"', '"say ""hi"""', "plain", "1234,56", "0,05"]);
  }},

  { name: "fmt shows euro amounts the German way, masks when hidden", async run(pg){
    const r = await pg.fn(() => {
      const keep = amountsHidden;
      amountsHidden = false; const shown = fmt(123456).replace(/\s/g, " ");
      amountsHidden = true;  const masked = fmt(123456);
      amountsHidden = keep;
      return { shown, masked };
    });
    assert.equal(r.shown, "1.234,56 €");
    assert.equal(r.masked, "••••");
  }},

  { name: "stateFromPayload keeps every field it is given", async run(pg){
    /* a field dropped here is a field erased by the next pull or restore */
    const r = await pg.fn(() => {
      const full = stateFromPayload(JSON.parse(JSON.stringify(state)));
      const again = stateFromPayload(JSON.parse(JSON.stringify(full)));
      const keys = Object.keys(stateCleared());
      return { same: JSON.stringify(full) === JSON.stringify(again),
               missing: keys.filter(k => !(k in full)) };
    });
    assert.equal(r.same, true);
    assert.deepEqual(r.missing, []);
  }}
];
