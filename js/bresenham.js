const x1Input = document.getElementById('x1');
const y1Input = document.getElementById('y1');
const x2Input = document.getElementById('x2');
const y2Input = document.getElementById('y2');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas = document.getElementById('algorithmCanvas');
const ctx = setupCanvas(canvas);
const pointCountSpan = document.getElementById('pointCount');
const p0Span = document.getElementById('p0Value');
const tableCountSpan = document.getElementById('tableCount');
const tableBodyDiv = document.getElementById('tableBody');

function bresenhamAlgorithm(x1, y1, x2, y2) {
  const pts = [], rows = [];
  let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx - dy, x = x1, y = y1, step = 0;
  const p0 = 2 * dy - dx;
  while (true) {
    pts.push({ x, y });
    const e2 = 2 * err;
    rows.push([step++, x, y, err, e2]);
    if (x === x2 && y === y2) break;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx)  { err += dx; y += sy; }
  }
  return { pts, rows, p0 };
}

function runBresenham() {
  const x1 = parseFloat(x1Input.value);
  const y1 = parseFloat(y1Input.value);
  const x2 = parseFloat(x2Input.value);
  const y2 = parseFloat(y2Input.value);
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    alert('Por favor ingrese valores numéricos válidos');
    return;
  }
  const { pts, rows, p0 } = bresenhamAlgorithm(x1, y1, x2, y2);
  const W = CANVAS_W, H = CANVAS_H;
  const scale = FIXED_SCALE;
  drawGrid(ctx, W, H);
  const p1c = toCanvas(x1, y1, W, H, scale);
  const p2c = toCanvas(x2, y2, W, H, scale);
  ctx.save();
  ctx.strokeStyle = COLORS.secondary + '66';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(p1c.x, p1c.y); ctx.lineTo(p2c.x, p2c.y); ctx.stroke();
  ctx.setLineDash([]);
  const drawnPts = pts.map((p, i) => {
    const cp = toCanvas(p.x, p.y, W, H, scale);
    drawPoint(ctx, cp.x, cp.y, COLORS.secondary, Math.max(5, scale * 0.6));
    return { cx: cp.x, cy: cp.y, rowIndex: i };
  });
  ctx.restore();
  registerPoints(drawnPts);
  pointCountSpan.textContent = pts.length;
  p0Span.textContent = p0;
  tableCountSpan.textContent = `${pts.length} puntos`;
  buildTable('tableBody', ['Paso', 'X', 'Y', 'Error (e)', '2e'], rows);
}

function clearView() {
  clearCanvas('algorithmCanvas');
  registerPoints([]);
  pointCountSpan.textContent = '—';
  p0Span.textContent = '—';
  tableCountSpan.textContent = '';
  tableBodyDiv.innerHTML = '<div class="empty-table">Ejecuta el algoritmo para ver los puntos calculados.</div>';
}

runBtn.addEventListener('click', runBresenham);
clearBtn.addEventListener('click', clearView);
setupHover(canvas);
drawGrid(ctx, CANVAS_W, CANVAS_H);