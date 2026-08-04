const ROWS_PER_DAY = 2;
const tbody = document.getElementById('tbody');
const STORAGE_PREFIX = 'weeklyJerseySales.v2';
let currentDays = [];

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

function getDaysFromPicker() {
  const picker = document.getElementById('weekStart');
  const start = new Date(picker.value + 'T00:00:00');
  if (isNaN(start)) return [];
  const days = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(formatDateLabel(d));
  }
  return days;
}

/* ---------- table builder ---------- */
function buildTable(days) {
  currentDays = days;
  tbody.innerHTML = '';

  days.forEach((day, dIdx) => {
    for (let r = 0; r < ROWS_PER_DAY; r++) {
      const tr = document.createElement('tr');
      tr.dataset.day = dIdx;
      const id = `d${dIdx}r${r}`;
      const dateCell = r === 0
        ? `<td class="date-cell" rowspan="${ROWS_PER_DAY + 1}">${day}${dIdx > 0 ? `<button type="button" class="copy-names" data-day="${dIdx}" title="Copy staff names from previous day">↳ Copy names</button>` : ''}</td>`
        : '';
      tr.innerHTML = dateCell + `
        <td><input type="text" class="cell-input staff-input" list="staffList" data-key="${id}.staff" data-col="staff" placeholder="Name"></td>
        <td><input type="text" class="cell-input q3" inputmode="numeric" data-key="${id}.q3" data-col="q3"></td>
        <td><input type="text" class="cell-input q2" inputmode="numeric" data-key="${id}.q2" data-col="q2"></td>
        <td><input type="text" class="cell-input q1" inputmode="numeric" data-key="${id}.q1" data-col="q1"></td>
        <td><input type="text" class="cell-input rowPcs" data-col="pcs" readonly></td>
        <td><input type="text" class="cell-input rowPts" data-col="pts" readonly></td>
        <td><input type="text" class="cell-input rowSales" inputmode="numeric" data-key="${id}.sales" data-col="sales"></td>
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
      <td><input type="text" class="tot-sales-input" inputmode="numeric" data-key="d${dIdx}.totalSales" data-col="sales" placeholder=""></td>
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

function saveData() {
  const data = {};
  typedInputs().forEach(inp => { if (inp.value) data[inp.dataset.key] = inp.value; });
  try { localStorage.setItem(getStorageKey(), JSON.stringify(data)); } catch (e) {}
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
  let grand3 = 0, grand2 = 0, grand1 = 0, grandPcs = 0;

  currentDays.forEach((day, dIdx) => {
    const rows = tbody.querySelectorAll(`tr[data-day="${dIdx}"]:not([data-total])`);
    let day3 = 0, day2 = 0, day1 = 0, dayPcs = 0, dayPts = 0, daySalesSum = 0;

    rows.forEach(tr => {
      const q3 = num(tr.querySelector('.q3').value);
      const q2 = num(tr.querySelector('.q2').value);
      const q1 = num(tr.querySelector('.q1').value);
      const pcs = q3 + q2 + q1;
      const pts = q3 * 3 + q2 * 2 + q1;
      tr.querySelector('.rowPcs').value = pcs ? pcs : '';
      tr.querySelector('.rowPts').value = pts ? pts : '';
      day3 += q3; day2 += q2; day1 += q1; dayPcs += pcs; dayPts += pts;
      daySalesSum += num(tr.querySelector('.rowSales').value);
    });

    const totalTr = tbody.querySelector(`tr[data-day="${dIdx}"][data-total="1"]`);
    totalTr.querySelector('.tot-q3').textContent = day3 || '';
    totalTr.querySelector('.tot-q2').textContent = day2 || '';
    totalTr.querySelector('.tot-q1').textContent = day1 || '';
    totalTr.querySelector('.tot-pcs').textContent = dayPcs || '';
    totalTr.querySelector('.tot-pts').textContent = dayPts || '';

    // reconciliation warning
    const totSalesInp = totalTr.querySelector('.tot-sales-input');
    const totSalesVal = num(totSalesInp.value);
    if (totSalesInp.value && daySalesSum > 0 && Math.abs(daySalesSum - totSalesVal) > 0.01) {
      totSalesInp.classList.add('reconcile-warn');
    } else {
      totSalesInp.classList.remove('reconcile-warn');
    }

    grand3 += day3; grand2 += day2; grand1 += day1; grandPcs += dayPcs;
  });

  document.getElementById('pcs3').value = grand3 || 0;
  document.getElementById('pcs2').value = grand2 || 0;
  document.getElementById('pcs1').value = grand1 || 0;
  document.getElementById('pcsTotal').value = grandPcs || 0;

  const actual = num(document.getElementById('actualSales').value);
  const target = num(document.getElementById('salesTarget').value);
  const diff = actual - target;
  document.getElementById('extraSales').value = diff > 0 ? diff.toFixed(2) : '0.00';
  document.getElementById('balanceSales').value = diff < 0 ? Math.abs(diff).toFixed(2) : '0.00';

  updateRunningBar();
}

/* ---------- week loader ---------- */
function updateWeekTitle() {
  const days = currentDays;
  if (!days.length) return;
  const inp = document.getElementById('weekTitle');
  if (!inp.value || inp.value.match(/^WEEK[:\s]/i)) {
    inp.value = `WEEK: ${days[0]} – ${days[days.length - 1]}`;
  }
}

function loadWeek() {
  const days = getDaysFromPicker();
  if (!days.length) return;
  buildTable(days);
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
document.getElementById('weekStart').addEventListener('change', loadWeek);
document.getElementById('weekStart').value = toDateInputValue(getMonday(new Date()));
loadWeek();
