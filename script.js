const days = ["2 Aug","3 Aug","4 Aug","5 Aug","6 Aug","7 Aug","8 Aug","9 Aug"];
const ROWS_PER_DAY = 2;
const tbody = document.getElementById('tbody');

function makeInput(cls, extra){
  return `<input type="text" class="cell-input ${cls||''}" ${extra||''}>`;
}

days.forEach((day, dIdx)=>{
  for(let r=0; r<ROWS_PER_DAY; r++){
    const tr = document.createElement('tr');
    tr.dataset.day = dIdx;
    if(r===0){
      tr.innerHTML = `
        <td class="date-cell" rowspan="${ROWS_PER_DAY+1}">${day}</td>
        <td>${makeInput('staff-input')}</td>
        <td>${makeInput('q3')}</td>
        <td>${makeInput('q2')}</td>
        <td>${makeInput('q1')}</td>
        <td>${makeInput('rowPcs','readonly')}</td>
        <td>${makeInput('rowPts','readonly')}</td>
        <td>${makeInput('rowSales')}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${makeInput('staff-input')}</td>
        <td>${makeInput('q3')}</td>
        <td>${makeInput('q2')}</td>
        <td>${makeInput('q1')}</td>
        <td>${makeInput('rowPcs','readonly')}</td>
        <td>${makeInput('rowPts','readonly')}</td>
        <td>${makeInput('rowSales')}</td>
      `;
    }
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
    <td><input type="text" class="tot-sales-input" placeholder=""></td>
  `;
  tbody.appendChild(totalTr);
});

function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function recalc(){
  // Only the per-row and per-day pcs/points totals are worked out automatically.
  // Sales (RM) and every field in the "1 WEEK SALES ACCUMULATED" box are filled
  // in by hand, so nothing below the table is ever computed or overwritten here.
  days.forEach((day, dIdx)=>{
    const rows = tbody.querySelectorAll(`tr[data-day="${dIdx}"]:not([data-total])`);
    let day3=0, day2=0, day1=0, dayPcs=0, dayPts=0;
    rows.forEach(tr=>{
      const q3 = num(tr.querySelector('.q3').value);
      const q2 = num(tr.querySelector('.q2').value);
      const q1 = num(tr.querySelector('.q1').value);
      const pcs = q3+q2+q1;
      const pts = q3*3 + q2*2 + q1*1;
      tr.querySelector('.rowPcs').value = pcs ? pcs : '';
      tr.querySelector('.rowPts').value = pts ? pts : '';
      day3+=q3; day2+=q2; day1+=q1; dayPcs+=pcs; dayPts+=pts;
    });
    const totalTr = tbody.querySelector(`tr[data-day="${dIdx}"][data-total="1"]`);
    totalTr.querySelector('.tot-q3').textContent = day3 || '';
    totalTr.querySelector('.tot-q2').textContent = day2 || '';
    totalTr.querySelector('.tot-q1').textContent = day1 || '';
    totalTr.querySelector('.tot-pcs').textContent = dayPcs || '';
    totalTr.querySelector('.tot-pts').textContent = dayPts || '';
    // Sales total cell is left untouched here - it's a manual input the user fills in.
  });
}

document.getElementById('sheet').addEventListener('input', recalc);
recalc();

document.getElementById('clearBtn').addEventListener('click', ()=>{
  if(!confirm('Clear all filled data?')) return;
  document.querySelectorAll('#sheet input:not(#weekTitle)').forEach(inp=>{ inp.value=''; });
  recalc();
});

// html2canvas draws <input> value text at a wrong vertical offset and then clips
// it at the input's box, so filled cells come out with their bottoms shaved off.
// Swapping each input for a static element of identical geometry avoids the bug
// entirely. Returns a function that puts the real inputs back.
function freezeInputsForCapture(root){
  const undo = [];
  root.querySelectorAll('input').forEach(inp=>{
    const cs = getComputedStyle(inp);
    const span = document.createElement('span');
    span.className = 'pdf-frozen';
    // A non-breaking space keeps empty fields at full height so blank rows and
    // the fill-in underlines don't collapse.
    span.textContent = inp.value || ' ';
    span.style.width = cs.width;
    span.style.padding = cs.padding;
    span.style.textAlign = cs.textAlign;
    // Set font properties individually rather than via the `font` shorthand,
    // which would also reset the line-height that gives the text room to render.
    span.style.lineHeight = '1.35';
    span.style.fontFamily = cs.fontFamily;
    span.style.fontSize = cs.fontSize;
    span.style.fontWeight = cs.fontWeight;
    span.style.color = cs.color;
    if(parseFloat(cs.borderBottomWidth) > 0){
      span.style.borderBottom = `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`;
    }
    inp.style.display = 'none';
    inp.parentNode.insertBefore(span, inp);
    undo.push(()=>{ span.remove(); inp.style.display = ''; });
  });
  return ()=>undo.forEach(fn=>fn());
}

document.getElementById('pdfBtn').addEventListener('click', async ()=>{
  const btn = document.getElementById('pdfBtn');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  const sheet = document.getElementById('sheet');
  let unfreeze = null;
  try{
    unfreeze = freezeInputsForCapture(sheet);

    const canvas = await html2canvas(sheet, {scale: 3, backgroundColor: '#ffffff'});
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin*2;
    const maxHeight = pageHeight - margin*2;

    // Fit the sheet inside the page on both axes and centre it, so a taller
    // sheet scales down instead of running off the bottom edge.
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
    const x = (pageWidth - imgWidth) / 2;
    const y = margin;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    const outletVal = document.getElementById('outlet').value || 'Outlet';
    pdf.save(`Weekly_Jersey_Sales_${outletVal.replace(/\s+/g,'_')}.pdf`);
  } finally {
    if(unfreeze) unfreeze();
    btn.textContent = 'Download as PDF';
    btn.disabled = false;
  }
});