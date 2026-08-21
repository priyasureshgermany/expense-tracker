import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

const inner = fs.readFileSync('/root/expense-tracker/kassenbuch.html', 'utf8');
const doc = `<!doctype html><html><head><meta charset="utf-8"></head><body>${inner}</body></html>`;
fs.writeFileSync('/root/expense-tracker/_test.html', doc);

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

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto('file:///root/expense-tracker/_test.html');
await page.waitForTimeout(1200);

const log = [];
const check = (name, cond, extra='') => log.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);

// --- 1. seed rendered ---
const net = await page.textContent('#netVal');
const rows = await page.locator('.row').count();
check('seed data renders', rows > 5, `${rows} rows, net ${net.trim()}`);

// --- 2. counts ---
const cAll = await page.textContent('#cAll');
const cPlan = await page.textContent('#cPlan');
const cDone = await page.textContent('#cDone');
check('counts add up', Number(cAll) === Number(cPlan) + Number(cDone), `${cAll} = ${cPlan} + ${cDone}`);

// --- 3. recurring rules materialised across months ---
const ruleSpread = await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem('kassenbuch.v1'));
  const months = new Set(raw.txns.filter(t => t.ruleId).map(t => t.date.slice(0,7)));
  const quarterly = raw.rules.find(r => r.freq === 'quarterly');
  const qDates = raw.txns.filter(t => t.ruleId === quarterly.id).map(t => t.date).sort();
  const bimonthly = raw.rules.find(r => r.freq === 'bimonthly');
  const bDates = raw.txns.filter(t => t.ruleId === bimonthly.id).map(t => t.date).sort();
  return { months: months.size, qDates, bDates, total: raw.txns.length };
});
check('rules span many months', ruleSpread.months >= 12, `${ruleSpread.months} months, ${ruleSpread.total} txns`);
const qGapOk = ruleSpread.qDates.every((d, i, a) => {
  if (!i) return true;
  const m1 = +a[i-1].slice(0,4)*12 + +a[i-1].slice(5,7);
  const m2 = +d.slice(0,4)*12 + +d.slice(5,7);
  return m2 - m1 === 3;
});
check('quarterly steps by 3 months', qGapOk, ruleSpread.qDates.slice(0,4).join(', '));
const bGapOk = ruleSpread.bDates.every((d, i, a) => {
  if (!i) return true;
  const m1 = +a[i-1].slice(0,4)*12 + +a[i-1].slice(5,7);
  const m2 = +d.slice(0,4)*12 + +d.slice(5,7);
  return m2 - m1 === 2;
});
check('bimonthly steps by 2 months', bGapOk, ruleSpread.bDates.slice(0,4).join(', '));

// --- 4. month navigation ---
const label0 = (await page.textContent('#mLabel')).trim();
await page.click('#nextM');
await page.waitForTimeout(150);
const label1 = (await page.textContent('#mLabel')).trim();
check('month nav changes view', label0 !== label1, `${label0} -> ${label1}`);
await page.click('#prevM');
await page.waitForTimeout(150);

// --- 5. mark a planned item paid ---
await page.click('.seg button[data-f="planned"]');
await page.waitForTimeout(200);
const planBefore = Number(await page.textContent('#cPlan'));
if (planBefore > 0) {
  await page.locator('.row .tick').first().click();
  await page.waitForTimeout(250);
  const planAfter = Number(await page.textContent('#cPlan'));
  check('tick marks planned as paid', planAfter === planBefore - 1, `${planBefore} -> ${planAfter}`);
} else {
  check('tick marks planned as paid', false, 'no planned items to test');
}
await page.click('.seg button[data-f="all"]');
await page.waitForTimeout(150);

// --- 6. add an entry ---
await page.click('#btnAdd');
await page.waitForTimeout(400);
await page.fill('#eAmt', '23,45');
await page.fill('#eNote', 'Test bakery run');
await page.click('#eSave');
await page.waitForTimeout(300);
const hasNew = await page.locator('.row', { hasText: 'Test bakery run' }).count();
check('add entry works', hasNew === 1);

// --- 7. amount parsing (German + English + edge cases) ---
const parseTests = await page.evaluate(() => {
  const cases = [
    ['1.234,56', 123456], ['1,234.56', 123456], ['1234,56', 123456], ['1234.56', 123456],
    ['-45,67', -4567], ['45,67', 4567], ['1.180,00', 118000], ['3.204,55', 320455],
    ['12,99', 1299], ['-1.180,00', -118000], ['0,99', 99], ['100', 10000],
    ['1.234', 123400], ['€ 45,67', 4567], ['', null], ['abc', null]
  ];
  return cases.map(([inp, want]) => ({ inp, want, got: parseAmount(inp) }))
              .filter(r => r.got !== r.want);
});
check('amount parser handles DE + EN formats', parseTests.length === 0,
  parseTests.length ? JSON.stringify(parseTests) : '16 cases');

// --- 8. Commerzbank import ---
await page.click('#btnImport');
await page.waitForTimeout(400);
await page.fill('#pasteCsv', COMMERZ);
await page.click('#parsePaste');
await page.waitForTimeout(400);
const cbRows = await page.locator('#impPrev .prow').count();
const cbSrc = await page.textContent('#impSource');
check('Commerzbank CSV parsed', cbRows === 5, `${cbRows} rows · ${cbSrc.trim()}`);
const cbDetail = await page.evaluate(() => pending.items.map(i => `${i.date} ${i.type} ${i.amount} ${i.category}`));
check('Commerzbank signs + categories correct',
  cbDetail.some(s => s.includes('income 320455 salary')) &&
  cbDetail.some(s => s.includes('expense 4567 groceries')) &&
  cbDetail.some(s => s.includes('expense 1299 subs')) &&
  cbDetail.some(s => s.includes('expense 118000 rent')),
  cbDetail.join(' | '));
await page.click('#impCommit');
await page.waitForTimeout(400);

// --- 9. Deutsche Bank import (Soll/Haben columns, cp1252 chars, trailing balance row) ---
await page.click('#btnImport');
await page.waitForTimeout(400);
await page.fill('#pasteCsv', DEUTSCHE);
await page.click('#parsePaste');
await page.waitForTimeout(400);
const dbRows = await page.locator('#impPrev .prow').count();
const dbDetail = await page.evaluate(() => pending.items.map(i => `${i.date} ${i.type} ${i.amount} ${i.category}`));
check('Deutsche Bank Soll/Haben parsed', dbRows === 3, `${dbRows} rows: ${dbDetail.join(' | ')}`);
check('DB debit/credit signs correct',
  dbDetail.some(s => s.includes('expense 8915 groceries')) &&
  dbDetail.some(s => s.includes('income 41200 refund')) &&
  dbDetail.some(s => s.includes('expense 5800 transport')),
  dbDetail.join(' | '));
await page.click('#impCommit');
await page.waitForTimeout(400);

// --- 10. dedupe on re-import ---
await page.click('#btnImport');
await page.waitForTimeout(400);
await page.fill('#pasteCsv', COMMERZ);
await page.click('#parsePaste');
await page.waitForTimeout(400);
const dupeCount = await page.evaluate(() => pending.items.filter(i => i.dupe).length);
const pickedCount = await page.evaluate(() => pending.items.filter(i => i.pick).length);
check('re-import detects duplicates', dupeCount === 5 && pickedCount === 0, `${dupeCount} dupes, ${pickedCount} preselected`);
await page.click('#shImport [data-close]');
await page.waitForTimeout(300);

// --- 11. persistence across reload ---
const beforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem('kassenbuch.v1')).txns.length);
await page.reload();
await page.waitForTimeout(900);
const afterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('kassenbuch.v1')).txns.length);
check('data survives reload without duplicating', afterReload === beforeReload, `${beforeReload} -> ${afterReload}`);

// --- 12. no horizontal overflow ---
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('no horizontal page scroll', overflow <= 0, `overflow ${overflow}px`);

// --- 13. screenshots, both themes ---
await page.evaluate(() => { document.documentElement.setAttribute('data-theme','light'); });
await page.waitForTimeout(400);
await page.screenshot({ path: '/root/expense-tracker/shot-light.png', fullPage: false });
await page.evaluate(() => { document.documentElement.setAttribute('data-theme','dark'); render(); });
await page.waitForTimeout(400);
await page.screenshot({ path: '/root/expense-tracker/shot-dark.png', fullPage: false });

// sheet screenshot
await page.evaluate(() => { document.documentElement.setAttribute('data-theme','light'); render(); });
await page.click('#btnAdd');
await page.waitForTimeout(600);
await page.screenshot({ path: '/root/expense-tracker/shot-sheet.png' });

// --- 14. un-stamped theme (system default) must still paint ---
await page.evaluate(() => { document.documentElement.removeAttribute('data-theme'); render(); });
await page.waitForTimeout(200);
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check('body paints an explicit background', bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent', bodyBg);

console.log(log.join('\n'));
console.log('\nconsole errors: ' + (errors.length ? '\n  ' + errors.join('\n  ') : 'none'));
await browser.close();

// --- 15. demo banner lifecycle ---
{
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport:{width:390,height:844} });
  const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  await p2.goto('file:///root/expense-tracker/_test.html');
  await p2.waitForTimeout(900);
  const shown = await p2.isVisible('#demoBar');
  await p2.click('#btnAdd'); await p2.waitForTimeout(400);
  await p2.fill('#eAmt','9,99'); await p2.click('#eSave'); await p2.waitForTimeout(400);
  const afterEdit = await p2.isVisible('#demoBar');
  await p2.reload(); await p2.waitForTimeout(900);
  const afterReload = await p2.isVisible('#demoBar');
  console.log(`${shown && !afterEdit && !afterReload ? 'PASS' : 'FAIL'}  demo banner shows then retires permanently — shown:${shown} afterEdit:${afterEdit} afterReload:${afterReload}`);

  // clear-demo button on a fresh profile
  const p3 = await (await b2.newContext()).newPage();
  await p3.goto('file:///root/expense-tracker/_test.html');
  await p3.waitForTimeout(900);
  await p3.click('#clearDemo'); await p3.waitForTimeout(400);
  const rowsLeft = await p3.locator('.row').count();
  const barGone = !(await p3.isVisible('#demoBar'));
  console.log(`${rowsLeft === 0 && barGone ? 'PASS' : 'FAIL'}  clear-examples empties the book — ${rowsLeft} rows, banner hidden:${barGone}`);
  console.log('phase-2 page errors: ' + (errs2.length ? errs2.join('; ') : 'none'));
  await b2.close();
}
