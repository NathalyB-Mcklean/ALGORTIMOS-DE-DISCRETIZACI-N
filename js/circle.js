const cxInput = document.getElementById('cx');
const cyInput = document.getElementById('cy');
const radiusInput = document.getElementById('radius');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas = document.getElementById('algorithmCanvas');
const ctx = setupCanvas(canvas);
const radiusStatSpan = document.getElementById('radiusStat');
const pointCountSpan = document.getElementById('pointCount');
const tableCountSpan = document.getElementById('tableCount');
const tableBodyDiv = document.getElementById('tableBody');

function circleAlgorithm(cx, cy, r) {
  const allPts = [], rows = [];
  let x = 0, y = r, p = 1 - r, step = 0;
  function plot(x, y) {
    [[cx+x,cy+y],[cx-x,cy+y],[cx+x,cy-y],[cx-x,cy-y],
     [cx+y,cy+x],[cx-y,cy+x],[cx+y,cy-x],[cx-y,cy-x]]
      .forEach(([px,py]) => allPts.push({x:px,y:py}));
  }
  while (x <= y) {
    plot(x, y);
    rows.push([step++, cx+x, cy+y, p,
      p < 0 ? `p + ${2*x+3} = ${p+2*x+3}` : `p + ${2*(x-y)+5} = ${p+2*(x-y)+5}`
    ]);
    if (p < 0) { p += 2*x+3; }
    else { p += 2*(x-y)+5; y--; }
    x++;
  }
  return { allPts, rows };
}

function runCircle() {
  const cx = parseFloat(cxInput.value);
  const cy = parseFloat(cyInput.value);
  const r  = parseFloat(radiusInput.value);
  if (isNaN(cx) || isNaN(cy) || isNaN(r) || r < 1) {
    alert('Ingrese valores válidos. El radio debe ser mayor a 0.');
    return;
  }
  const { allPts, rows } = circleAlgorithm(cx, cy, r);
  const W = CANVAS_W, H = CANVAS_H;
  const scale = getScale([{x:cx+r,y:cy+r},{x:cx-r,y:cy-r}], W, H);
  drawGrid(ctx, W, H);
  const center = toCanvas(cx, cy, W, H, scale);
  ctx.save();
  ctx.strokeStyle = COLORS.tertiary + '66';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.arc(center.x, center.y, r*scale, 0, 2*Math.PI); ctx.stroke();
  ctx.setLineDash([]);
  const drawnPts = allPts.map((p, i) => {
    const cp = toCanvas(p.x, p.y, W, H, scale);
    drawPoint(ctx, cp.x, cp.y, COLORS.tertiary, Math.max(4, scale*0.5));
    return { cx: cp.x, cy: cp.y, rowIndex: Math.floor(i / 8) };
  });
  ctx.fillStyle = COLORS.tertiary;
  ctx.font = 'bold 10px Tahoma, sans-serif';
  ctx.fillText(`C(${cx},${cy}) | r = ${r}`, center.x+8, center.y-8);
  drawPoint(ctx, center.x, center.y, '#000000', 4);
  ctx.restore();
  registerPoints(drawnPts);
  radiusStatSpan.textContent = r;
  pointCountSpan.textContent = allPts.length;
  tableCountSpan.textContent = `${rows.length} pasos (octante 1)`;
  buildTable('tableBody', ['Paso','X','Y','p (decisión)','Siguiente p'], rows);
}

function clearView() {
  clearCanvas('algorithmCanvas');
  registerPoints([]);
  radiusStatSpan.textContent = '—';
  pointCountSpan.textContent = '—';
  tableCountSpan.textContent = '';
  tableBodyDiv.innerHTML = '<div class="empty-table">Ejecuta el algoritmo para ver los puntos calculados.</div>';
}

runBtn.addEventListener('click', runCircle);
clearBtn.addEventListener('click', clearView);
setupHover(canvas);
drawGrid(ctx, CANVAS_W, CANVAS_H);