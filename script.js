const ROWS_PER_DAY = 3;
const DAYS_PER_WEEK = 7;
const tbody = document.getElementById('tbody');
const STORAGE_PREFIX = 'weeklyJerseySales.v2';
let currentDays = [];   // "3 Aug" labels
let currentDates = [];  // the Date behind each label, for weekday/weekend

/* ---------- earnings (Lokalteez briefing, August 2026) ----------
   Tier 2 outlets. Points per piece come from the hanger price card:
   black = 1, grey/gold = 2, Merdeka = 3, free items excluded.
   Worked out per staff member per day: RM0.60 a piece once the day reaches the
   qualifying piece count, plus a point reward on top. The point reward does not
   itself depend on qualifying. */
const WEEKEND_DAYS = [5, 6, 0]; // Friday, Saturday, Sunday
const REWARD_TIERS = {
  weekday: [[15, 8], [25, 18], [35, 28]],
  weekend: [[25, 18], [35, 28], [45, 38]]
};
const PIECE_RATE = 0.60;
// Pieces needed before the RM0.60 starts paying. Once the day qualifies every
// piece pays, including the ones past the threshold - there is no second block
// to reach.
const PIECE_QUALIFY = { weekday: 10, weekend: 15 };

function isWeekendDay(date) {
  return !!date && WEEKEND_DAYS.indexOf(date.getDay()) !== -1;
}

// Highest threshold reached, and it stays there - selling more can never pay
// less than selling fewer.
function pointReward(points, weekend) {
  const table = weekend ? REWARD_TIERS.weekend : REWARD_TIERS.weekday;
  let rm = 0;
  for (let i = 0; i < table.length; i++) {
    if (points >= table[i][0]) rm = table[i][1];
  }
  return rm;
}

function pieceCommission(pcs, weekend) {
  const need = weekend ? PIECE_QUALIFY.weekend : PIECE_QUALIFY.weekday;
  return pcs >= need ? pcs * PIECE_RATE : 0;
}

// What the row is worth: the piece commission plus the point reward on top.
// The point reward is not conditional on qualifying for the piece commission.
function rowEarnings(pcs, points, weekend) {
  return pieceCommission(pcs, weekend) + pointReward(points, weekend);
}

function fmtRM(v) {
  const r = Math.round(v * 100) / 100;
  return 'RM ' + (r % 1 === 0 ? r : r.toFixed(2));
}

/* ---------- helpers ---------- */
function num(v) {
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Formats for a <input type="date"> using local calendar parts. Assigning
// valueAsDate instead would read the Date's UTC parts, which east of Greenwich
// lands on the previous day during the early hours and starts the week a day
// short.
function toDateInputValue(d) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateLabel(d) {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${m[d.getMonth()]}`;
}

function getDatesFromPicker() {
  const picker = document.getElementById('weekStart');
  const start = new Date(picker.value + 'T00:00:00');
  if (isNaN(start)) return [];
  const dates = [];
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/* ---------- table builder ---------- */
function buildTable(dates) {
  currentDates = dates;
  currentDays = dates.map(formatDateLabel);
  tbody.innerHTML = '';

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  currentDays.forEach((day, dIdx) => {
    const weekend = isWeekendDay(dates[dIdx]);
    for (let r = 0; r < ROWS_PER_DAY; r++) {
      const tr = document.createElement('tr');
      tr.dataset.day = dIdx;
      const id = `d${dIdx}r${r}`;
      // The day name makes it obvious which reward table a row is being paid
      // on, since Fri/Sat/Sun use the higher weekend thresholds.
      const dateCell = r === 0
        ? `<td class="date-cell${weekend ? ' weekend-cell' : ''}" rowspan="${ROWS_PER_DAY + 1}">${day}<span class="day-name">${dayNames[dates[dIdx].getDay()]}</span>${dIdx > 0 ? `<button type="button" class="copy-names" data-day="${dIdx}" title="Copy staff names from previous day">↳ Copy names</button>` : ''}</td>`
        : '';
      tr.innerHTML = dateCell + `
        <td><input type="text" class="cell-input staff-input" list="staffList" data-key="${id}.staff" data-col="staff"></td>
        <td><input type="text" class="cell-input q3" inputmode="numeric" data-key="${id}.q3" data-col="q3"></td>
        <td><input type="text" class="cell-input q2" inputmode="numeric" data-key="${id}.q2" data-col="q2"></td>
        <td><input type="text" class="cell-input q1" inputmode="numeric" data-key="${id}.q1" data-col="q1"></td>
        <td><input type="text" class="cell-input rowPcs" data-col="pcs" readonly></td>
        <td><input type="text" class="cell-input rowPts" data-col="pts" readonly></td>
        <td><div class="sales-wrap"><span class="cur">RM</span><input type="text" class="cell-input rowSales" inputmode="decimal" data-key="${id}.sales" data-col="sales"><span class="slash">/</span><span class="rowEarn">RM 0</span></div></td>
      `;
      tbody.appendChild(tr);
    }

    const totalTr = document.createElement('tr');
    totalTr.className = 'total-row';
    totalTr.dataset.day = dIdx;
    totalTr.dataset.total = '1';
    totalTr.innerHTML = `
      <td class="total-label">TOTAL:</td>
      <td class="tot-q3"></td>
      <td class="tot-q2"></td>
      <td class="tot-q1"></td>
      <td class="tot-pcs"></td>
      <td class="tot-pts"></td>
      <td><div class="sales-wrap tot-sales-wrap"><span class="cur">RM</span><input type="text" class="tot-sales-input" data-col="sales" readonly></div></td>
    `;
    tbody.appendChild(totalTr);
  });

  tbody.querySelectorAll('.copy-names').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      copyPreviousDay(parseInt(btn.dataset.day));
    });
  });
}

/* ---------- copy previous day ---------- */
function copyPreviousDay(dayIdx) {
  if (dayIdx === 0) return;
  const prevRows = tbody.querySelectorAll(`tr[data-day="${dayIdx - 1}"]:not([data-total])`);
  const currRows = tbody.querySelectorAll(`tr[data-day="${dayIdx}"]:not([data-total])`);
  currRows.forEach((tr, i) => {
    const prev = prevRows[i];
    if (!prev) return;
    const pInp = prev.querySelector('.staff-input');
    const cInp = tr.querySelector('.staff-input');
    if (pInp && cInp && pInp.value.trim()) {
      cInp.value = pInp.value.trim();
      cInp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  saveData();
}

/* ---------- storage (per week) ---------- */
function getStorageKey() {
  return `${STORAGE_PREFIX}.${document.getElementById('weekStart').value || 'default'}`;
}

function typedInputs() {
  return document.querySelectorAll('#sheet input[data-key]');
}

function collectFields() {
  const data = {};
  typedInputs().forEach(inp => { if (inp.value) data[inp.dataset.key] = inp.value; });
  return data;
}

function saveData() {
  try { localStorage.setItem(getStorageKey(), JSON.stringify(collectFields())); } catch (e) {}
}

function loadData() {
  let data;
  try { data = JSON.parse(localStorage.getItem(getStorageKey()) || '{}'); } catch (e) { return; }
  if (!data || typeof data !== 'object') return;
  typedInputs().forEach(inp => {
    const v = data[inp.dataset.key];
    if (typeof v === 'string') inp.value = v;
  });
}

/* ---------- hand-off between devices ----------
   The exported PDF is a flat picture of the sheet, so there is nothing in it a
   machine can read back. Instead the figures are written into the PDF's own
   metadata as base64 JSON behind this marker. Whoever receives the file can
   import it and carry on entering the rest of the week, rather than typing the
   earlier days in again. The marker is deliberately unusual so it can be found
   by scanning the raw bytes without a PDF parser. */
const DATA_MARKER = 'JJSDATA1:';

function encodeUtf8Base64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CHUNK = 0x8000; // chunked so a long week doesn't blow the argument limit
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

function decodeUtf8Base64(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function buildTransferPayload() {
  return {
    v: 1,
    weekStart: document.getElementById('weekStart').value,
    fields: collectFields()
  };
}

// Scans backwards, because the metadata sits near the end of the file while the
// megabytes of image data sit in front of it. Returns candidates newest-first so
// a chance match inside the image can be discarded by trying the next one.
function findEmbeddedPayloads(bytes) {
  const mark = [];
  for (let i = 0; i < DATA_MARKER.length; i++) mark.push(DATA_MARKER.charCodeAt(i));
  const found = [];
  for (let i = bytes.length - mark.length; i >= 0 && found.length < 5; i--) {
    let hit = true;
    for (let j = 0; j < mark.length; j++) {
      if (bytes[i + j] !== mark[j]) { hit = false; break; }
    }
    if (!hit) continue;
    let k = i + mark.length, s = '';
    while (k < bytes.length) {
      const c = bytes[k];
      const isB64 = (c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
                    (c >= 48 && c <= 57) || c === 43 || c === 47 || c === 61;
      if (!isB64) break;
      s += String.fromCharCode(c);
      k++;
    }
    if (s) found.push(s);
  }
  return found;
}

function readPayloadFromPdf(bytes) {
  for (const b64 of findEmbeddedPayloads(bytes)) {
    try {
      const obj = JSON.parse(decodeUtf8Base64(b64));
      if (obj && typeof obj === 'object' && obj.fields && typeof obj.fields === 'object') return obj;
    } catch (e) {
      // Not our data - almost certainly a coincidental match in the image bytes.
    }
  }
  return null;
}

function applyImported(payload) {
  const ws = payload.weekStart;
  if (typeof ws === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ws)) {
    document.getElementById('weekStart').value = ws;
    rememberWeek();
  }
  const dates = getDatesFromPicker();
  if (!dates.length) return false;

  buildTable(dates);
  const fields = payload.fields || {};
  // Replace rather than merge, so the sheet matches the PDF exactly.
  typedInputs().forEach(inp => {
    const v = fields[inp.dataset.key];
    inp.value = typeof v === 'string' ? v : '';
  });
  if (!fields.weekTitle) updateWeekTitle();
  recalc();
  updateStaffDatalist();
  saveData();
  return true;
}

function describePayload(payload) {
  const f = payload.fields || {};
  const staff = Object.keys(f).filter(k => k.endsWith('.staff') && f[k].trim()).length;
  const bits = [];
  bits.push(f.weekTitle || ('Week starting ' + (payload.weekStart || '?')));
  if (f.outlet) bits.push('Outlet: ' + f.outlet);
  if (f.leader) bits.push('Team Leader: ' + f.leader);
  bits.push(staff + ' staff row' + (staff === 1 ? '' : 's') + ' filled in');
  return bits.join('\n');
}

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const input = e.target;
  const file = input.files && input.files[0];
  input.value = ''; // so picking the same file again still fires a change
  if (!file) return;

  const btn = document.getElementById('importBtn');
  const label = btn.textContent;
  btn.textContent = 'Reading...';
  btn.disabled = true;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const payload = readPayloadFromPdf(bytes);
    if (!payload) {
      alert('No form data found in that PDF.\n\nOnly PDFs exported by this form can be imported. A PDF saved before this feature was added, or printed from somewhere else, has nothing to read.');
      return;
    }
    if (!confirm('Import this report?\n\n' + describePayload(payload) +
                 '\n\nThis replaces what is currently on screen for that week.')) return;
    if (applyImported(payload)) {
      alert('Imported. You can carry on filling in the rest of the week.');
    } else {
      alert('That report has no usable week date, so it could not be loaded.');
    }
  } catch (err) {
    alert('Could not read that file: ' + (err && err.message ? err.message : err));
  } finally {
    btn.textContent = label;
    btn.disabled = false;
  }
});

/* ---------- staff autocomplete ---------- */
function updateStaffDatalist() {
  const names = new Set();
  document.querySelectorAll('.staff-input').forEach(inp => {
    if (inp.value.trim()) names.add(inp.value.trim());
  });
  const dl = document.getElementById('staffList');
  dl.innerHTML = '';
  names.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    dl.appendChild(opt);
  });
}

/* ---------- running bar ---------- */
function updateRunningBar() {
  const target = num(document.getElementById('salesTarget').value);
  const actual = num(document.getElementById('actualSales').value);
  const grandPcs = num(document.getElementById('pcsTotal').value);
  const diff = actual - target;

  document.getElementById('runTarget').textContent = target
    ? 'RM ' + target.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-';
  document.getElementById('runActual').textContent = actual
    ? 'RM ' + actual.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '-';
  document.getElementById('runPcs').textContent = grandPcs ? grandPcs.toLocaleString() : '0';

  const diffEl = document.getElementById('runDiff');
  const diffLbl = document.getElementById('runDiffLabel');
  if (!target && !actual) {
    diffEl.textContent = '-';
    diffLbl.textContent = 'Diff:';
    diffEl.style.color = '#fff';
  } else if (diff >= 0) {
    diffEl.textContent = 'RM ' + diff.toFixed(2);
    diffLbl.textContent = 'Extra:';
    diffEl.style.color = '#90ee90';
  } else {
    diffEl.textContent = 'RM ' + Math.abs(diff).toFixed(2);
    diffLbl.textContent = 'Balance:';
    diffEl.style.color = '#ff9999';
  }
}

/* ---------- core calculator ---------- */
function recalc() {
  let grand3 = 0, grand2 = 0, grand1 = 0, grandPcs = 0, grandSales = 0, anySalesTyped = false;

  currentDays.forEach((day, dIdx) => {
    const rows = tbody.querySelectorAll(`tr[data-day="${dIdx}"]:not([data-total])`);
    const weekend = isWeekendDay(currentDates[dIdx]);
    let day3 = 0, day2 = 0, day1 = 0, dayPcs = 0, dayPts = 0, daySalesSum = 0;
    let dayTouched = false, dayHasSales = false;

    rows.forEach(tr => {
      const q3i = tr.querySelector('.q3');
      const q2i = tr.querySelector('.q2');
      const q1i = tr.querySelector('.q1');
      const rowSales = tr.querySelector('.rowSales');
      // A quantity typed as 0 is a real answer and has to read 0, so what
      // decides whether a cell is filled in is that something was typed - not
      // whether the result happens to be more than nothing. Only a row nobody
      // has touched is left blank, so unused days still print clean.
      const touched = !!(q3i.value.trim() || q2i.value.trim() || q1i.value.trim());
      const hasSales = rowSales.value.trim() !== '';
      if (touched) dayTouched = true;
      if (hasSales) { dayHasSales = true; anySalesTyped = true; }

      const q3 = num(q3i.value);
      const q2 = num(q2i.value);
      const q1 = num(q1i.value);
      const pcs = q3 + q2 + q1;
      const pts = q3 * 3 + q2 * 2 + q1;
      tr.querySelector('.rowPcs').value = touched ? pcs : '';
      tr.querySelector('.rowPts').value = touched ? pts : '';
      // The reward is earned per staff member per day, so it comes off this
      // row's own points rather than the day's combined total.
      const earned = rowEarnings(pcs, pts, weekend);
      tr.querySelector('.rowEarn').textContent = fmtRM(earned);
      tr.querySelector('.sales-wrap').classList.toggle('is-empty', !touched && !hasSales);
      day3 += q3; day2 += q2; day1 += q1; dayPcs += pcs; dayPts += pts;
      daySalesSum += num(rowSales.value);
    });

    const totalTr = tbody.querySelector(`tr[data-day="${dIdx}"][data-total="1"]`);
    totalTr.querySelector('.tot-q3').textContent = dayTouched ? day3 : '';
    totalTr.querySelector('.tot-q2').textContent = dayTouched ? day2 : '';
    totalTr.querySelector('.tot-q1').textContent = dayTouched ? day1 : '';
    totalTr.querySelector('.tot-pcs').textContent = dayTouched ? dayPcs : '';
    totalTr.querySelector('.tot-pts').textContent = dayTouched ? dayPts : '';
    // No commission on the TOTAL row - it is worked out per staff member only,
    // so the day's cell carries the sales figure alone, added up from the
    // individual sales above it.
    const totSalesInp = totalTr.querySelector('.tot-sales-input');
    totSalesInp.value = dayHasSales ? daySalesSum.toFixed(2) : '';
    totalTr.querySelector('.sales-wrap')
      .classList.toggle('is-empty', !dayHasSales);

    grand3 += day3; grand2 += day2; grand1 += day1; grandPcs += dayPcs;
    grandSales += daySalesSum;
  });

  document.getElementById('pcs3').value = grand3 || 0;
  document.getElementById('pcs2').value = grand2 || 0;
  document.getElementById('pcs1').value = grand1 || 0;
  document.getElementById('pcsTotal').value = grandPcs || 0;

  // Actual Sales is the eight day totals added together, which are themselves
  // the individual sales added up. Only Sales Target is still typed in.
  const actualEl = document.getElementById('actualSales');
  actualEl.value = anySalesTyped ? grandSales.toFixed(2) : '';
  const actual = grandSales;
  const target = num(document.getElementById('salesTarget').value);
  const diff = actual - target;
  document.getElementById('extraSales').value = diff > 0 ? diff.toFixed(2) : '0.00';
  document.getElementById('balanceSales').value = diff < 0 ? Math.abs(diff).toFixed(2) : '0.00';

  updateRunningBar();
}

/* ---------- week loader ---------- */
// "17 AUG", to match the printed form's capitals.
function upperDateLabel(d) {
  const m = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${d.getDate()} ${m[d.getMonth()]}`;
}

// Which week of its own month the sheet covers, counted from the start date:
// the 1st-7th is week 1, the 8th-14th week 2, and so on.
function weekOfMonth(d) {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

// "WEEK 3: 17 AUG – 23 AUG 2026". The year is written once at the end unless
// the week runs across New Year, when both are needed to stay unambiguous.
function defaultWeekTitle(dates) {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const head = `WEEK ${weekOfMonth(first)}: ${upperDateLabel(first)}`;
  return first.getFullYear() === last.getFullYear()
    ? `${head} – ${upperDateLabel(last)} ${last.getFullYear()}`
    : `${head} ${first.getFullYear()} – ${upperDateLabel(last)} ${last.getFullYear()}`;
}

function updateWeekTitle() {
  if (!currentDates.length) return;
  const inp = document.getElementById('weekTitle');
  if (!inp.value || inp.value.match(/^WEEK[:\s]/i)) {
    inp.value = defaultWeekTitle(currentDates);
  }
}

function loadWeek() {
  const dates = getDatesFromPicker();
  if (!dates.length) return;
  buildTable(dates);
  loadData();
  recalc();
  updateWeekTitle();
  updateStaffDatalist();
}

/* ---------- excel paste ---------- */
document.getElementById('sheet').addEventListener('paste', (e) => {
  const target = e.target;
  if (!target.matches('input.cell-input, input.tot-sales-input')) return;

  const raw = (e.clipboardData || window.clipboardData).getData('text');
  if (!raw.includes('\t') && !raw.includes('\n')) return;

  e.preventDefault();
  const pastedRows = raw.trimEnd().split('\n').map(r => r.split('\t'));

  const targetTr = target.closest('tr');
  const allRows = Array.from(tbody.querySelectorAll('tr'));
  const startRowIdx = allRows.indexOf(targetTr);
  const rowInputs = Array.from(targetTr.querySelectorAll('input'));
  const startColIdx = rowInputs.indexOf(target);
  if (startColIdx === -1) return;

  pastedRows.forEach((pastedRow, rOff) => {
    const tableRow = allRows[startRowIdx + rOff];
    if (!tableRow) return;
    const tInputs = Array.from(tableRow.querySelectorAll('input'));
    let cIdx = startColIdx;
    pastedRow.forEach((val) => {
      while (cIdx < tInputs.length && tInputs[cIdx].readOnly) cIdx++;
      if (cIdx < tInputs.length) {
        tInputs[cIdx].value = val.trim();
        tInputs[cIdx].dispatchEvent(new Event('input', { bubbles: true }));
        cIdx++;
      }
    });
  });

  recalc();
  saveData();
});

/* ---------- keyboard navigation ---------- */
function getEditableTableInputs() {
  return Array.from(tbody.querySelectorAll('input:not([readonly])'));
}

document.getElementById('sheet').addEventListener('keydown', (e) => {
  const target = e.target;
  if (!target.matches('input.cell-input, input.tot-sales-input')) return;

  const all = getEditableTableInputs();
  const idx = all.indexOf(target);
  if (idx === -1) return;
  const col = target.dataset.col;

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      if (idx + 1 < all.length) all[idx + 1].focus();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (idx - 1 >= 0) all[idx - 1].focus();
      break;
    case 'ArrowDown':
    case 'Enter':
      e.preventDefault();
      for (let i = idx + 1; i < all.length; i++) {
        if (all[i].dataset.col === col) { all[i].focus(); break; }
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      for (let i = idx - 1; i >= 0; i--) {
        if (all[i].dataset.col === col) { all[i].focus(); break; }
      }
      break;
  }
});

/* ---------- global input listener ---------- */
document.getElementById('sheet').addEventListener('input', (e) => {
  recalc();
  saveData();
  if (e.target.classList.contains('staff-input')) updateStaffDatalist();
});

/* ---------- clear ---------- */
document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear all filled data for this week?')) return;
  document.querySelectorAll('#sheet input:not([readonly]):not(#weekTitle)').forEach(inp => { inp.value = ''; });
  recalc();
  saveData();
  updateStaffDatalist();
});

/* ---------- PDF export ---------- */
const EXPORT_WIDTH = 820;

function freezeInputsForCapture(root) {
  const undo = [];
  root.querySelectorAll('input').forEach(inp => {
    const cs = getComputedStyle(inp);
    const span = document.createElement('span');
    span.className = 'pdf-frozen';
    span.textContent = inp.value || ' ';
    span.style.width = cs.width;
    span.style.padding = cs.padding;
    span.style.textAlign = cs.textAlign;
    span.style.lineHeight = '1.35';
    span.style.fontFamily = cs.fontFamily;
    span.style.fontSize = cs.fontSize;
    span.style.fontWeight = cs.fontWeight;
    span.style.color = cs.color;
    if (parseFloat(cs.borderBottomWidth) > 0) {
      span.style.borderBottom = `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`;
    }
    inp.style.display = 'none';
    inp.parentNode.insertBefore(span, inp);
    undo.push(() => { span.remove(); inp.style.display = ''; });
  });
  return () => undo.forEach(fn => fn());
}

document.getElementById('pdfBtn').addEventListener('click', async () => {
  const btn = document.getElementById('pdfBtn');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  const sheet = document.getElementById('sheet');
  let unfreeze = null;
  const prevWidth = sheet.style.width;
  const prevMaxWidth = sheet.style.maxWidth;
  // Captured before the inputs are swapped out for the capture.
  const transfer = DATA_MARKER + encodeUtf8Base64(JSON.stringify(buildTransferPayload()));

  sheet.querySelectorAll('.copy-names').forEach(b => b.style.display = 'none');

  try {
    sheet.style.width = EXPORT_WIDTH + 'px';
    sheet.style.maxWidth = 'none';
    unfreeze = freezeInputsForCapture(sheet);

    const canvas = await html2canvas(sheet, {
      scale: 3,
      backgroundColor: '#ffffff',
      width: EXPORT_WIDTH,
      windowWidth: EXPORT_WIDTH
    });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxW = pw - margin * 2;
    const maxH = ph - margin * 2;

    const sc = Math.min(maxW / canvas.width, maxH / canvas.height);
    const iw = canvas.width * sc;
    const ih = canvas.height * sc;
    const x = (pw - iw) / 2;
    const y = margin;

    pdf.addImage(imgData, 'PNG', x, y, iw, ih);

    const outletVal = document.getElementById('outlet').value || 'Outlet';

    // Rides along in the document metadata so the next person can import it.
    pdf.setProperties({
      title: 'Weekly Jersey Sales & Point Record - ' + outletVal,
      subject: document.getElementById('weekTitle').value || 'Weekly Jersey Sales',
      creator: 'Weekly Jersey Sales & Point Record',
      keywords: transfer
    });

    pdf.save(`Weekly_Jersey_Sales_${outletVal.replace(/\s+/g, '_')}.pdf`);
  } finally {
    if (unfreeze) unfreeze();
    sheet.style.width = prevWidth;
    sheet.style.maxWidth = prevMaxWidth;
    sheet.querySelectorAll('.copy-names').forEach(b => b.style.display = '');
    btn.textContent = 'Download as PDF';
    btn.disabled = false;
  }
});

/* ---------- init ---------- */
// The week on screen is remembered too, not just the figures in it. Without
// this, refreshing while working on another week snapped back to the current
// one and the sheet looked empty, even though the entries were safe.
const LAST_WEEK_KEY = 'weeklyJerseySales.lastWeek';

function rememberWeek() {
  try { localStorage.setItem(LAST_WEEK_KEY, document.getElementById('weekStart').value); } catch (e) {}
}

function initialWeekValue() {
  try {
    const v = localStorage.getItem(LAST_WEEK_KEY);
    if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  } catch (e) {}
  return toDateInputValue(getMonday(new Date()));
}

document.getElementById('weekStart').addEventListener('change', () => {
  rememberWeek();
  loadWeek();
});
document.getElementById('weekStart').value = initialWeekValue();
loadWeek();
