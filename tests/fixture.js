/*
 * Evaluated in the page after every load. Gives the tests one known book and a
 * fixed "today", so the figures below can be worked out by hand once and stay
 * true whatever day the tests are run on.
 *
 * Nothing here is saved: the book is put in memory only, and save() is held
 * off while a test runs, so the test profile's storage never changes either.
 */
window.__T = (() => {
  const realToday = todayISO;
  const realSave = save;

  /** Three accounts, eight months, and the cases that must not count. */
  function book(){
    const tx = [];
    let k = 0;
    const add = (date, type, amount, account, extra) => tx.push(Object.assign({
      id:"t" + (k++), date, type, amount, account, fromAccount:null,
      category: type === "income" ? "salary" : "groceries", status:"done", note:""
    }, extra || {}));
    for (let m = 3; m <= 10; m++){
      const mm = String(m).padStart(2, "0");
      add("2026-" + mm + "-01", "income",   320000,   "a1");
      add("2026-" + mm + "-05", "expense",  118000,   "a1");
      add("2026-" + mm + "-12", "expense",  4567 * m, "a2");
      add("2026-" + mm + "-20", "transfer", 20000,    "a2", { fromAccount:"a1", category:null });
      add("2026-" + mm + "-25", "expense",  1999,     "a3");
      add("2026-" + mm + "-28", "expense",  3333,     null);            /* names no account */
    }
    add("2026-10-30", "expense", 99900, "a1");                          /* ticked off, dated ahead */
    add("2026-10-10", "expense", 55500, "a1", { status:"planned" });    /* not happened */
    return stateFromPayload({
      txns: tx,
      accounts: [
        { id:"a1", n:"Giro",   kind:"bank", start:{ amount:500000, date:"2026-06-15" } },
        { id:"a2", n:"Cash",   kind:"cash", start:{ amount:20000,  date:"2026-08-01" } },
        { id:"a3", n:"PayPal", kind:"card" }
      ],
      profile: { first:"Test" },
      balLine: true          /* the balance line is off by default; the book shows it */
    });
  }

  /** Put the book in place, with today pinned to 14 Oct 2026 and saving held off. */
  function useBook(){
    todayISO = () => "2026-10-14";
    save = () => {};
    state = book();
    amountsHidden = false;
    render();
  }

  function restore(){
    todayISO = realToday;
    save = realSave;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* App lock lives in this device's storage, not the book: a test that touches
     it puts every lock key back as it found it. */
  const lockKeys = () => Object.keys(localStorage).filter(k => k.indexOf("panappai.lock.") === 0);
  function lockSnapshot(){
    const snap = {};
    lockKeys().forEach(k => { snap[k] = localStorage.getItem(k); });
    return snap;
  }
  function lockRestore(snap){
    lockKeys().forEach(k => localStorage.removeItem(k));
    Object.keys(snap).forEach(k => localStorage.setItem(k, snap[k]));
    document.documentElement.classList.remove("locked");
    lockHideLogin();
  }
  /* the real date, for things fixed when the page loaded (a calendar's limit) */
  return { book, useBook, restore, sleep, realToday, lockSnapshot, lockRestore };
})();
