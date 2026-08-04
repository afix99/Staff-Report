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
    <td class="total-label" colspan="2">TOTAL:</td>
    <td class="tot-q3"></td>
    <td class="tot-q2"></td>
    <td class="tot-q1"></td>
    <td class="tot-pcs"></td>
    <td class="tot-pts"></td>
    <td class="tot-sales"></td>
  `;
  tbody.appendChild(totalTr);
});

function num(v){ const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function recalc(){
  let grand3=0, grand2=0, grand1=0, grandPcs=0, grandSales=0;

  days.forEach((day, dIdx)=>{
    const rows = tbody.querySelectorAll(`tr[data-day="${dIdx}"]:not([data-total])`);
    let day3=0, day2=0, day1=0, dayPcs=0, dayPts=0, daySales=0;
    rows.forEach(tr=>{
      const q3 = num(tr.querySelector('.q3').value);
      const q2 = num(tr.querySelector('.q2').value);
      const q1 = num(tr.querySelector('.q1').value);
      const pcs = q3+q2+q1;
      const pts = q3*3 + q2*2 + q1*1;
      const sales = num(tr.querySelector('.rowSales').value);
      tr.querySelector('.rowPcs').value = pcs ? pcs : '';
      tr.querySelector('.rowPts').value = pts ? pts : '';
      day3+=q3; day2+=q2; day1+=q1; dayPcs+=pcs; dayPts+=pts; daySales+=sales;
    });
    const totalTr = tbody.querySelector(`tr[data-day="${dIdx}"][data-total="1"]`);
    totalTr.querySelector('.tot-q3').textContent = day3 || '';
    totalTr.querySelector('.tot-q2').textContent = day2 || '';
    totalTr.querySelector('.tot-q1').textContent = day1 || '';
    totalTr.querySelector('.tot-pcs').textContent = dayPcs || '';
    totalTr.querySelector('.tot-pts').textContent = dayPts || '';
    totalTr.querySelector('.tot-sales').textContent = daySales ? daySales.toFixed(2) : '';

    grand3+=day3; grand2+=day2; grand1+=day1; grandPcs+=dayPcs; grandSales+=daySales;
  });

  document.getElementById('pcs3').value = grand3 || 0;
  document.getElementById('pcs2').value = grand2 || 0;
  document.getElementById('pcs1').value = grand1 || 0;
  document.getElementById('pcsTotal').value = grandPcs || 0;
  document.getElementById('actualSales').value = grandSales.toFixed(2);

  const target = num(document.getElementById('salesTarget').value);
  const diff = grandSales - target;
  document.getElementById('extraSales').value = diff > 0 ? diff.toFixed(2) : '0.00';
  document.getElementById('balanceSales').value = diff < 0 ? Math.abs(diff).toFixed(2) : '0.00';
}

document.getElementById('sheet').addEventListener('input', recalc);
recalc();

document.getElementById('clearBtn').addEventListener('click', ()=>{
  if(!confirm('Clear all filled data?')) return;
  document.querySelectorAll('#sheet input:not(#weekTitle)').forEach(inp=>{ inp.value=''; });
  recalc();
});

document.getElementById('pdfBtn').addEventListener('click', async ()=>{
  const btn = document.getElementById('pdfBtn');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  const sheet = document.getElementById('sheet');
  const inputs = sheet.querySelectorAll('input');
  inputs.forEach(i=>{ i.style.borderBottom = i.classList.contains('cell-input') ? 'none' : i.style.borderBottom; });

  const canvas = await html2canvas(sheet, {scale: 3, backgroundColor: '#ffffff'});
  const imgData = canvas.toDataURL('image/png');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 40;
  const imgHeight = canvas.height * (imgWidth / canvas.width);

  let y = 20;
  if(imgHeight <= pageHeight - 40){
    pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
  } else {
    const scaleFactor = (pageHeight - 40) / imgHeight;
    pdf.addImage(imgData, 'PNG', 20, y, imgWidth*scaleFactor, imgHeight*scaleFactor);
  }

  const outletVal = document.getElementById('outlet').value || 'Outlet';
  pdf.save(`Weekly_Jersey_Sales_${outletVal.replace(/\s+/g,'_')}.pdf`);

  btn.textContent = 'Download as PDF';
  btn.disabled = false;
});