const x1Input = document.getElementById('x1');
const y1Input = document.getElementById('y1');
const x2Input = document.getElementById('x2');
const y2Input = document.getElementById('y2');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');
const canvas = document.getElementById('algorithmCanvas');
const ctx = setupCanvas(canvas);
const pointCountSpan = document.getElementById('pointCount');
const stepCountSpan = document.getElementById('stepCount');
const tableCountSpan = document.getElementById('tableCount');
const tableBodyDiv = document.getElementById('tableBody');

function ddaAlgorithm(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const xInc = dx / steps;
  const yInc = dy / steps;
  let x = x1, y = y1;
  const pts = [], rows = [];
  for (let i = 0; i <= steps; i++) {
    const rx = Math.round(x), ry = Math.round(y);
    pts.push({ x: rx, y: ry });
    rows.push([i, rx, ry, x.toFixed(3), y.toFixed(3)]);
    x += xInc; y += yInc;
  }
  return { pts, rows, steps };
}

function runDDA() {
  const x1 = parseFloat(x1Input.value);
  const y1 = parseFloat(y1Input.value);
  const x2 = parseFloat(x2Input.value);
  const y2 = parseFloat(y2Input.value);
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
    alert('Por favor ingrese valores numéricos válidos');
    return;
  }
  const { pts, rows, steps } = ddaAlgorithm(x1, y1, x2, y2);
  const W = CANVAS_W, H = CANVAS_H;
  const scale = getScale([{x: x1, y: y1}, {x: x2, y: y2}], W, H);
  drawGrid(ctx, W, H);
  const p1 = toCanvas(x1, y1, W, H, scale);
  const p2 = toCanvas(x2, y2, W, H, scale);
  ctx.save();
  ctx.strokeStyle = COLORS.primary + '66';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  ctx.setLineDash([]);
  const drawnPts = pts.map((p, i) => {
    const cp = toCanvas(p.x, p.y, W, H, scale);
    drawPoint(ctx, cp.x, cp.y, COLORS.primary, Math.max(5, scale * 0.6));
    return { cx: cp.x, cy: cp.y, rowIndex: i };
  });
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 10px Tahoma, sans-serif';
  ctx.fillText(`P1(${x1},${y1})`, p1.x + 8, p1.y - 6);
  ctx.fillText(`P2(${x2},${y2})`, p2.x + 8, p2.y - 6);
  ctx.restore();
  registerPoints(drawnPts);
  pointCountSpan.textContent = pts.length;
  stepCountSpan.textContent = steps;
  tableCountSpan.textContent = `${pts.length} puntos`;
  buildTable('tableBody', ['Paso', 'X (redondeado)', 'Y (redondeado)', 'X (real)', 'Y (real)'], rows);
}

function clearView() {
  clearCanvas('algorithmCanvas');
  registerPoints([]);
  pointCountSpan.textContent = '—';
  stepCountSpan.textContent = '—';
  tableCountSpan.textContent = '';
  tableBodyDiv.innerHTML = '<div class="empty-table">Ejecuta el algoritmo para ver los puntos calculados.</div>';
}

runBtn.addEventListener('click', runDDA);
clearBtn.addEventListener('click', clearView);
setupHover(canvas);
drawGrid(ctx, CANVAS_W, CANVAS_H);