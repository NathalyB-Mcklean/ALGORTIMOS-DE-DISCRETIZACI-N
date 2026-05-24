const COLORS = {
  primary: '#7ba5b5',
  secondary: '#9bbf8f',
  tertiary: '#b5c8a3',
  warm: '#e3c9a0',
  grid: 'rgba(123, 165, 181, 0.2)',
  axis: '#9bbf8f',
  axisLabel: '#7a8a6e'
};

const CANVAS_W = 560;
const CANVAS_H = 420;
const FIXED_SCALE = 14; // -20 a 20 en X, -15 a 15 en Y aprox

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_W * dpr;
  canvas.height = CANVAS_H * dpr;
  canvas.style.width = CANVAS_W + 'px';
  canvas.style.height = CANVAS_H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

function drawGrid(ctx, W, H) {
  const scale = FIXED_SCALE;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const cx = Math.floor(W / 2);
  const cy = Math.floor(H / 2);

  // Líneas de cuadrícula cada unidad
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.8;
  for (let x = cx % scale; x <= W; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = cy % scale; y <= H; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Ejes
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

  // Labels numéricos cada 5 unidades
  ctx.fillStyle = COLORS.axisLabel;
  ctx.font = '9px Tahoma, sans-serif';
  ctx.textAlign = 'center';
  for (let val = -20; val <= 20; val += 5) {
    if (val === 0) continue;
    const px = cx + val * scale;
    if (px >= 0 && px <= W) {
      ctx.fillText(val, px, cy + 14);
    }
  }
  ctx.textAlign = 'right';
  const maxY = Math.floor(cy / scale);
  for (let val = -maxY; val <= maxY; val += 5) {
    if (val === 0) continue;
    const py = cy - val * scale;
    if (py >= 0 && py <= H) {
      ctx.fillText(val, cx - 6, py + 4);
    }
  }

  // Cero
  ctx.textAlign = 'right';
  ctx.fillText('0', cx - 6, cy + 14);

  // Flechas de ejes
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W - 10, cy - 4); ctx.lineTo(W, cy); ctx.lineTo(W - 10, cy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 4, 10); ctx.lineTo(cx, 0); ctx.lineTo(cx + 4, 10); ctx.stroke();

  // X Y labels
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 11px Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('X', W - 8, cy - 8);
  ctx.fillText('Y', cx + 12, 12);
}

function toCanvas(wx, wy, W, H, scale) {
  return { x: W / 2 + wx * scale, y: H / 2 - wy * scale };
}

function drawPoint(ctx, px, py, color, size) {
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.05)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.rect(px - size / 2, py - size / 2, size, size);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function getScale(points, W, H) {
  return FIXED_SCALE;
}

function buildTable(containerId, headers, rows) {
  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => html += `<td>${cell}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  document.getElementById(containerId).innerHTML = html;
}

function clearCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dpr = window.devicePixelRatio || 1;
  ctx.scale(dpr, dpr);
  drawGrid(ctx, CANVAS_W, CANVAS_H);
}

// ── Hover system ──
let _drawnPoints = [];

function registerPoints(points) {
  _drawnPoints = points;
}

function setupHover(canvas) {
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const radius = 10;
    let found = null;
    for (const pt of _drawnPoints) {
      const dx = mx - pt.cx;
      const dy = my - pt.cy;
      if (Math.sqrt(dx * dx + dy * dy) < radius) {
        found = pt;
        break;
      }
    }
    document.querySelectorAll('#tableBody tr.highlighted')
      .forEach(r => r.classList.remove('highlighted'));
    if (found !== null) {
      canvas.style.cursor = 'crosshair';
      const rows = document.querySelectorAll('#tableBody tbody tr');
      if (rows[found.rowIndex]) {
        rows[found.rowIndex].classList.add('highlighted');
        rows[found.rowIndex].scrollIntoView({ block: 'nearest' });
      }
    } else {
      canvas.style.cursor = 'default';
    }
  });
}