const cxInput = document.getElementById('cx');
const cyInput = document.getElementById('cy');
const aInput  = document.getElementById('a');
const bInput  = document.getElementById('b');
const runBtn  = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas  = document.getElementById('algorithmCanvas');
const ctx     = setupCanvas(canvas);
const abStatSpan    = document.getElementById('abStat');
const pointCountSpan = document.getElementById('pointCount');
const tableCountSpan = document.getElementById('tableCount');
const tableBodyDiv   = document.getElementById('tableBody');


function ellipseAlgorithm(cx, cy, a, b) {
  const allPts = [], rows = [];
  let step = 0;
  //toma un solo punto $(x, y)$ calculado para el primer cuadrante y, de forma automática, 
  // calcula y guarda sus 3 reflejos correspondientes en los demás cuadrantes
  function plot(x, y) {
    [[cx+x,cy+y],[cx-x,cy+y],[cx+x,cy-y],[cx-x,cy-y]]
      .forEach(([px,py]) => allPts.push({x:px,y:py}));
  }
  let x=0, y=b;
  let d1 = b*b - a*a*b + 0.25*a*a;
  let dx = 2*b*b*x, dy = 2*a*a*y;
  while (dx < dy) {
    plot(x, y);
    rows.push([step++, cx+x, cy+y, d1.toFixed(2), 'Región 1']);
    if (d1 < 0) { d1 += b*b*(2*x+3); }
    else { d1 += b*b*(2*x+3)+a*a*(-2*y+2); y--; dy -= 2*a*a; }
    x++; dx += 2*b*b;
  }
  let d2 = b*b*(x+0.5)*(x+0.5)+a*a*(y-1)*(y-1)-a*a*b*b;
  while (y >= 0) {
    plot(x, y);
    rows.push([step++, cx+x, cy+y, d2.toFixed(2), 'Región 2']);
    if (d2 > 0) { d2 += a*a*(-2*y+3); }
    else { d2 += b*b*(2*x+2)+a*a*(-2*y+3); x++; dx += 2*b*b; }
    y--; dy -= 2*a*a;
  }
  return { allPts, rows };
}

function runEllipse() {
  const cx = parseFloat(cxInput.value);
  const cy = parseFloat(cyInput.value);
  const a  = parseFloat(aInput.value);
  const b  = parseFloat(bInput.value);
  if (isNaN(cx)||isNaN(cy)||isNaN(a)||isNaN(b)||a<1||b<1) {
    alert('Ingrese valores válidos. Los semiejes deben ser mayores a 0.');
    return;
  }
  const { allPts, rows } = ellipseAlgorithm(cx, cy, a, b);
  const W = CANVAS_W, H = CANVAS_H;
  const scale = FIXED_SCALE;
  drawGrid(ctx, W, H);
  const center = toCanvas(cx, cy, W, H, scale);
  ctx.save();
  ctx.strokeStyle = COLORS.warm + '66';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, a*scale, b*scale, 0, 0, 2*Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  const drawnPts = allPts.map((p, i) => {
    const cp = toCanvas(p.x, p.y, W, H, scale);
    drawPoint(ctx, cp.x, cp.y, COLORS.warm, Math.max(4, scale*0.5));
    return { cx: cp.x, cy: cp.y, rowIndex: Math.floor(i / 4) };
  });
  drawPoint(ctx, center.x, center.y, '#000000', 4);
  ctx.restore();
  registerPoints(drawnPts);
  abStatSpan.textContent = `a = ${a}, b = ${b}`;
  pointCountSpan.textContent = allPts.length;
  tableCountSpan.textContent = `${rows.length} pasos (cuadrante 1)`;
  buildTable('tableBody', ['Paso','X','Y','p (decisión)','Región'], rows);
}

function clearView() {
  clearCanvas('algorithmCanvas');
  registerPoints([]);
  abStatSpan.textContent = '—';
  pointCountSpan.textContent = '—';
  tableCountSpan.textContent = '';
  tableBodyDiv.innerHTML = '<div class="empty-table">Ejecuta el algoritmo para ver los puntos calculados.</div>';
}

runBtn.addEventListener('click', runEllipse);
clearBtn.addEventListener('click', clearView);
setupHover(canvas);
drawGrid(ctx, CANVAS_W, CANVAS_H);