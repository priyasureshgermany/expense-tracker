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

  { name: "monoSegs: smooth, through every point, never past a point's value", async run(pg){
    const r = await pg.fn(() => {
      const at = (c, t) => { const u = 1 - t;
        return u*u*u*c.y0 + 3*u*u*t*c.c1y + 3*u*t*t*c.c2y + t*t*t*c.y1; };
      const sets = [
        [0, 1, 0],                     /* a peak: the top is the point itself */
        [5, 5, 5, 9],                  /* a flat run stays flat */
        [10, 2, 30, 31, 0, 0, 40],     /* steep turns and a zero floor */
        [3, 7],                        /* two points: a straight line */
        [-20, 60, -5, 80, 80, 10]
      ];
      const out = { through:true, overshoot:[], flat:null, straight:null, curved:false };
      sets.forEach((ys, si) => {
        const segs = monoSegs(ys.map((y, i) => ({ x:i * 10, y })));
        segs.forEach((c, i) => {
          if (c.y0 !== ys[i] || c.y1 !== ys[i + 1]) out.through = false;
          if (c.c1y !== c.y0 + (c.y1 - c.y0) / 3 || c.c2y !== c.y1 - (c.y1 - c.y0) / 3) out.curved = true;
          const lo = Math.min(c.y0, c.y1) - 1e-9, hi = Math.max(c.y0, c.y1) + 1e-9;
          for (let t = 0; t <= 1; t += 0.02){
            const y = at(c, t);
            if (y < lo || y > hi) { out.overshoot.push(si + ":" + i + "@" + t.toFixed(2)); break; }
          }
        });
        /* both handles of the flat gap, and the first handle leaving it */
        if (si === 1) out.flat = [segs[0].c1y, segs[0].c2y, segs[1].c1y];
        if (si === 3) out.straight = [segs[0].c1y, segs[0].c2y];
      });
      return out;
    });
    assert.equal(r.through, true);
    assert.deepEqual(r.overshoot, []);
    assert.deepEqual(r.flat, [5, 5, 5]);
    assert.ok(Math.abs(r.straight[0] - (3 + 4 / 3)) < 1e-9 && Math.abs(r.straight[1] - (7 - 4 / 3)) < 1e-9,
              "two points make a straight line: " + r.straight);
    assert.equal(r.curved, true, "the corners are rounded, not straight lines");
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

  { name: "occurrence steps each cadence, clamping to short months", async run(pg){
    const r = await pg.fn(() => [
      occurrence("2026-01-31", "monthly", 1),     /* no 31 Feb */
      occurrence("2026-01-31", "monthly", 2),     /* back to the 31st */
      occurrence("2026-11-15", "bimonthly", 1),   /* across the year */
      occurrence("2026-01-10", "quarterly", 3),
      occurrence("2026-03-31", "halfyearly", 1),
      occurrence("2028-02-29", "yearly", 1),      /* leap day to a common year */
      occurrence("2026-10-14", "weekly", 3),
      occurrence("2026-12-20", "days28", 1)
    ]);
    assert.deepEqual(r, ["2026-02-28", "2026-03-31", "2027-01-15", "2026-10-10",
                         "2026-09-30", "2029-02-28", "2026-11-04", "2027-01-17"]);
  }},

  { name: "parseDateCell reads bank date formats", async run(pg){
    const r = await pg.fn(() => ["03.08.2026", "3.8.26", "2026-08-03", "03/08/2026", "Kontostand", ""].map(parseDateCell));
    assert.deepEqual(r, ["2026-08-03", "2026-08-03", "2026-08-03", "2026-08-03", null, null]);
  }},

  { name: "guessCat files common German payees", async run(pg){
    const r = await pg.fn(() => [
      guessCat("REWE SAGT DANKE", false), guessCat("MIETE HAUSVERWALTUNG", false),
      guessCat("DEUTSCHLANDTICKET", false), guessCat("NETFLIX INTERNATIONAL", false),
      guessCat("LOHN / GEHALT", true), guessCat("STEUERERSTATTUNG FINANZAMT", true),
      guessCat("XYZ UNKNOWN", false), guessCat("XYZ UNKNOWN", true)]);
    assert.deepEqual(r, ["groceries_de", "rent", "transport", "subs", "salary", "refund", "other", "other_in"]);
  }},

  { name: "balance line setting: off unless the book says true", async run(pg){
    const r = await pg.fn(() => [stateFromPayload({}).balLine, stateFromPayload({ balLine:true }).balLine,
                                 stateFromPayload({ balLine:"yes" }).balLine]);
    assert.deepEqual(r, [false, true, false]);
  }},

  { name: "normaliseProfile keeps birth date and location, rejects impossible dates", async run(pg){
    const r = await pg.fn(() => [
      normaliseProfile({ first:" Suresh ", dob:"1990-05-17", location:" Frankfurt am Main, Germany " }),
      normaliseProfile({ dob:"2026-02-31" }),            /* no such day */
      normaliseProfile({ dob:"17.05.1990", location:"" }),
      normaliseProfile({ location:"Chennai" }),
      normaliseProfile({ dob:"2028-02-29" })             /* a real leap day */
    ]);
    assert.deepEqual(r[0], { first:"Suresh", last:"", email:"", dob:"1990-05-17", location:"Frankfurt am Main, Germany" });
    assert.equal(r[1], null);
    assert.equal(r[2], null);
    assert.deepEqual(r[3], { first:"", last:"", email:"", dob:"", location:"Chennai" });
    assert.equal(r[4].dob, "2028-02-29");
  }},

  { name: "password login: salted slow hash, exact password, any-case username", async run(pg){
    const r = await pg.fn(async () => {
      const snap = __T.lockSnapshot();
      await pwStore("  Suresh ", "Kaffee&Kuchen1");
      const rec1 = localStorage.getItem(LOCK_PW_KEY), user = localStorage.getItem(LOCK_USER_KEY);
      const out = {
        user, iter: JSON.parse(rec1).i,
        plain: Object.keys(localStorage).some(k => (localStorage.getItem(k) || "").includes("Kaffee")),
        ok:        await pwCheck("suresh", "Kaffee&Kuchen1"),
        okCase:    await pwCheck("SURESH  ", "Kaffee&Kuchen1"),
        wrongPw:   await pwCheck("suresh", "kaffee&kuchen1"),
        wrongUser: await pwCheck("priya", "Kaffee&Kuchen1"),
        empty:     await pwCheck("suresh", "")
      };
      await pwStore("Suresh", "Kaffee&Kuchen1");
      out.saltChanges = JSON.parse(localStorage.getItem(LOCK_PW_KEY)).h !== JSON.parse(rec1).h;
      __T.lockRestore(snap);
      out.kindDefault = lockKind();
      return out;
    });
    assert.equal(r.user, "suresh");
    assert.ok(r.iter >= 100000, "PBKDF2 rounds: " + r.iter);
    assert.equal(r.plain, false, "the password is nowhere in storage as typed");
    assert.equal(r.ok, true); assert.equal(r.okCase, true);
    assert.equal(r.wrongPw, false, "passwords are compared exactly");
    assert.equal(r.wrongUser, false); assert.equal(r.empty, false);
    assert.equal(r.saltChanges, true, "a fresh salt each time it is set");
    assert.equal(r.kindDefault, "pin", "the PIN is the default");
  }},

  { name: "ageOn counts whole years, ticking over on the birthday itself", async run(pg){
    const r = await pg.fn(() => [
      ageOn("1990-05-17", "2026-10-14"),   /* birthday already past this year */
      ageOn("1990-10-14", "2026-10-14"),   /* it is today */
      ageOn("1990-10-15", "2026-10-14"),   /* tomorrow */
      ageOn("2000-02-29", "2025-02-28"),   /* leap-day birth, common year: not yet */
      ageOn("2000-02-29", "2025-03-01"),   /* ...but by 1 March */
      ageOn("2000-02-29", "2028-02-29"),   /* and on the day itself in a leap year */
      ageOn("2026-01-01", "2026-10-14"),   /* under a year */
      ageOn("2027-01-01", "2026-10-14"),   /* not born yet */
      ageOn("", "2026-10-14"),
      ageText(1), ageText(36), ageText(0), ageText(null)
    ]);
    assert.deepEqual(r, [36, 36, 35, 24, 25, 28, 0, null, null,
                         "1 year old", "36 years old", "Under a year old", ""]);
  }},

  { name: "subscriptions: a month and a year whatever the rhythm, paused and income left out", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      state.rules = [
        { id:"r1", type:"expense", amount:1000,  category:"groceries", freq:"monthly",   active:true },
        { id:"r2", type:"expense", amount:30000, category:"groceries", freq:"quarterly", active:true, auto:true },
        { id:"r3", type:"expense", amount:12000, category:"groceries", freq:"yearly",    active:true },
        { id:"r4", type:"expense", amount:1000,  category:"groceries", freq:"weekly",    active:true },
        { id:"r5", type:"expense", amount:5000,  category:"groceries", freq:"monthly",   active:false },
        { id:"r6", type:"income",  amount:300000, category:"salary",   freq:"monthly",   active:true }];
      const list = subsList();
      const out = { ids: list.map(x => x.r.id), r2: [list.find(x => x.r.id === "r2").month, list.find(x => x.r.id === "r2").year],
                    tot: subsTotals(list) };
      __T.restore();
      return out;
    });
    /* by hand: 12 000 + 120 000 + 12 000 + 52 000 a year; the paused one and the income are not bills */
    assert.deepEqual(r.ids, ["r2", "r4", "r1", "r3", "r5"]);
    assert.deepEqual(r.r2, [10000, 120000], "a quarterly 300 € is 100 € a month, 1 200 € a year");
    assert.deepEqual(r.tot, { year:196000, month:16333, n:4, auto:1 });
  }},

  { name: "periodForecast: now + income to come − bills to pay − budgets left, this period only", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();                                   /* today = 14 Oct 2026: the period is 15 Sep – 14 Oct */
      const add = (id, type, amount, date, status, extra) => state.txns.push(Object.assign(
        { id, type, amount, date, status, category: type === "income" ? "salary" : "dining", account:"a1", fromAccount:null, note:"" }, extra || {}));
      add("f1", "income",   100000, "2026-10-13", "planned");                 /* counts */
      add("f2", "income",   777700, "2026-10-20", "planned");                 /* next period: no */
      add("f3", "expense",   88800, "2026-08-01", "planned");                 /* an old plan: no */
      add("f4", "transfer",  50000, "2026-10-12", "planned", { fromAccount:"a2", category:null });   /* nets to nothing */
      add("f5", "expense",    5000, "2026-10-01", "done");                    /* spent from the dining budget */
      state.budgets = { dining:20000 };
      const f = periodForecast();
      state.catchAll = "dining";
      const asCatch = periodForecast().budgets;
      __T.restore();
      return { f, asCatch };
    });
    const f = r.f;
    assert.deepEqual([f.from, f.to], ["2026-09-15", "2026-10-14"]);
    assert.equal(f.now, 1137366 - 5000, "the balance card's own figure, after the dining spend");
    assert.equal(f.inc, 100000);
    assert.equal(f.bills, 55500, "the book's planned 555 € on 10 Oct; the old plan is not counted");
    assert.equal(f.budgets, 15000, "200 € budget less 50 € spent");
    assert.equal(f.value, f.now + f.inc - f.bills - f.budgets);
    assert.equal(f.value, 1161866);
    assert.equal(r.asCatch, 0, "the catch-all is the cushion: its unspent part is not taken off");
  }},

  { name: "ledger search: note, category, account, date and amount the ways people type it", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const t = { id:"q1", type:"expense", amount:118000, category:"rent", status:"done", date:"2026-03-05",
                  account:"a1", fromAccount:null, note:"Miete Wohnung" };
      const m = q => ledMatch(t, ledNorm(q).split(" ").filter(Boolean));
      const out = {
        note: m("wohnung"), cat: m("rent"), acct: m("giro"), date: m("mar 2026"),
        comma: m("1.180,00"), plain: m("1180"), dot: m("1180.00"),
        both: m("miete giro"), wrong: m("miete paypal"), other: m("netflix")
      };
      amountsHidden = true;
      out.hiddenAmount = m("1180");
      out.hiddenNote = m("miete");
      amountsHidden = false;
      __T.restore();
      return out;
    });
    assert.deepEqual(r, { note:true, cat:true, acct:true, date:true, comma:true, plain:true, dot:true,
                          both:true, wrong:false, other:false, hiddenAmount:false, hiddenNote:true });
  }},

  { name: "savings goals: saved, missing, a month's share to the date; bad data is dropped", async run(pg){
    const r = await pg.fn(() => {
      const T = "2026-10-14";
      const g = { id:"g1", n:"India", target:200000, due:"2027-06-30",
                  adds:[{ id:"a", date:"2026-09-01", amount:50000 }, { id:"b", date:"2026-10-01", amount:30000 },
                        { id:"c", date:"2026-10-10", amount:-10000 }] };
      const out = {
        st: goalStats(g, T),
        reached: goalStats(Object.assign({}, g, { target:70000 }), T),
        late: goalStats(Object.assign({}, g, { due:"2026-09-01" }), T),
        nodate: goalStats(Object.assign({}, g, { due:null }), T),
        sameMonth: goalStats(Object.assign({}, g, { due:"2026-10-31" }), T).perMonth,
        norm: normaliseGoals([g, { id:"x", n:"", target:100 }, { id:"y", n:"Car", target:0 },
          { id:"z", n:" Bike ", target:50000, due:"soon", adds:[{ id:"q", date:"yesterday", amount:5 }, { id:"w", date:"2026-10-02", amount:0 }] }]),
        round: stateFromPayload(JSON.parse(JSON.stringify({ goals:[g] }))).goals
      };
      return out;
    });
    /* 2 000 € by June 2027, 700 € in: 1 300 € over Nov…Jun, 8 months */
    assert.deepEqual(r.st, { saved:70000, left:130000, pct:35, reached:false, months:8, perMonth:16250, late:false });
    assert.equal(r.reached.reached, true); assert.equal(r.reached.perMonth, null);
    assert.equal(r.late.late, true); assert.equal(r.late.perMonth, null);
    assert.equal(r.nodate.perMonth, null);
    assert.equal(r.sameMonth, 130000, "due this month: all of it now");
    assert.deepEqual(r.norm.map(x => x.id), ["g1", "z"]);
    assert.deepEqual(r.norm[1], { id:"z", n:"Bike", target:50000, due:null, adds:[] });
    assert.deepEqual(r.round[0], r.norm[0], "a backup keeps the goal as it was");
  }},

  { name: "year summary: 1 Jan – 31 Dec, settled only, no transfers, categories add up to the totals", async run(pg){
    const r = await pg.fn(() => {
      __T.useBook();
      const add = (id, type, amount, date, category) => state.txns.push({ id, type, amount, date, category, status:"done", account:"a1", fromAccount:null, note:"" });
      add("y1", "expense", 1000, "2025-12-31", "education");   /* last year, by one day */
      add("y2", "income",   500, "2026-01-01", "interest");    /* this year, by one day */
      const a = yearSummary(2026), b = yearSummary(2025);
      const out = { years: taxYears(),
        a: { inc:a.inc, out:a.out, net:a.net, income:a.income.map(x => [x.id, x.sum, !!x.hint]), expense:a.expense.map(x => [x.id, x.sum]),
             sumIn: a.income.reduce((n, x) => n + x.sum, 0), sumOut: a.expense.reduce((n, x) => n + x.sum, 0) },
        b: { out:b.out, expense:b.expense.map(x => [x.id, x.sum, x.hint]) },
        csvLines: buildEntriesCsv(state.txns.filter(t => t.date.slice(0, 4) === "2025")).trim().split("\r\n").length };
      __T.restore();
      return out;
    });
    /* by hand: 8 salaries of 3 200 + 5 € interest; out: Giro 8×1 180, Cash 45,67×(3+…+10), PayPal 8×19,99,
       the loose 8×33,33, and the 999 € paid ahead on 30 Oct (settled, dated this year). Planned and transfers: no. */
    assert.deepEqual(r.years, [2026, 2025]);
    assert.equal(r.a.inc, 2560500);
    assert.equal(r.a.out, 944000 + 237484 + 15992 + 26664 + 99900);
    assert.equal(r.a.net, r.a.inc - r.a.out);
    assert.deepEqual(r.a.income, [["salary", 2560000, false], ["interest", 500, true]]);
    assert.equal(r.a.sumIn, r.a.inc); assert.equal(r.a.sumOut, r.a.out);
    assert.deepEqual(r.b.out, 1000);
    assert.equal(r.b.expense[0][0], "education"); assert.match(r.b.expense[0][2], /Werbungskosten/);
    assert.equal(r.csvLines, 2, "the year's CSV: a header and its one entry");
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
