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
  const step = 40;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.8;
  for (let x = 0; x <= W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  const cx = Math.floor(W / 2);
  const cy = Math.floor(H / 2);
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.fillStyle = COLORS.axisLabel;
  ctx.font = '9px Tahoma, sans-serif';
  ctx.textAlign = 'center';
  for (let x = step; x < W; x += step) {
    const val = Math.round((x - cx) / step);
    if (val !== 0) ctx.fillText(val, x, cy + 14);
  }
  ctx.textAlign = 'right';
  for (let y = step; y < H; y += step) {
    const val = -Math.round((y - cy) / step);
    if (val !== 0) ctx.fillText(val, cx - 6, y + 4);
  }
  ctx.fillStyle = COLORS.axisLabel;
  ctx.textAlign = 'right';
  ctx.fillText('0', cx - 6, cy + 14);
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W - 10, cy - 4); ctx.lineTo(W, cy); ctx.lineTo(W - 10, cy + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 4, 10); ctx.lineTo(cx, 0); ctx.lineTo(cx + 4, 10); ctx.stroke();
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
  if (!points.length) return 40;
  const xs = points.map(p => Math.abs(p.x));
  const ys = points.map(p => Math.abs(p.y));
  const maxX = Math.max(...xs, 1);
  const maxY = Math.max(...ys, 1);
  const s = Math.min((W / 2 - 50) / maxX, (H / 2 - 50) / maxY, 40);
  return Math.max(s, 8);
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