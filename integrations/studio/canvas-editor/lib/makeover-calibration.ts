export type CalibrationPoint = { x: number; y: number };
export type CalibrationQuad = [CalibrationPoint, CalibrationPoint, CalibrationPoint, CalibrationPoint];
type Matrix3 = [number, number, number, number, number, number, number, number, number];

const finite = (value: number) => Number.isFinite(value);
const cross = (a: CalibrationPoint, b: CalibrationPoint, c: CalibrationPoint) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

export function validateCalibrationQuad(points: CalibrationPoint[], width: number, height: number): points is CalibrationQuad {
  if (points.length !== 4 || !finite(width) || !finite(height) || width <= 0 || height <= 0) return false;
  if (!points.every(p => finite(p.x) && finite(p.y) && p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height)) return false;
  const orientation = cross(points[0], points[1], points[2]);
  if (Math.abs(orientation) < width * height * .0005) return false;
  for (let i = 0; i < 4; i++) {
    const turn = cross(points[i], points[(i + 1) % 4], points[(i + 2) % 4]);
    if (turn * orientation <= 0 || Math.abs(turn) < width * height * .0005) return false;
    const a = points[i], b = points[(i + 1) % 4];
    if (Math.hypot(b.x - a.x, b.y - a.y) < Math.min(width, height) * .02) return false;
  }
  return true;
}

function solve(matrix: number[][], values: number[]): number[] {
  const rows = matrix.map((row, i) => [...row, values[i]]);
  for (let column = 0; column < values.length; column++) {
    let pivot = column;
    for (let row = column + 1; row < values.length; row++)
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    if (Math.abs(rows[pivot][column]) < 1e-10) throw new Error("Nie można obliczyć perspektywy.");
    [rows[pivot], rows[column]] = [rows[column], rows[pivot]];
    const divisor = rows[column][column];
    for (let j = column; j <= values.length; j++) rows[column][j] /= divisor;
    for (let row = 0; row < values.length; row++) {
      if (row === column) continue;
      const factor = rows[row][column];
      for (let j = column; j <= values.length; j++) rows[row][j] -= factor * rows[column][j];
    }
  }
  return rows.map(row => row[values.length]);
}

export function makeCalibrationHomography(sourceWidth: number, sourceHeight: number, quad: CalibrationQuad): Matrix3 {
  if (!finite(sourceWidth) || !finite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0)
    throw new Error("Nieprawidłowy rozmiar wzoru nawierzchni.");
  const source = [{ x: 0, y: 0 }, { x: sourceWidth, y: 0 }, { x: sourceWidth, y: sourceHeight }, { x: 0, y: sourceHeight }];
  const matrix: number[][] = [], values: number[] = [];
  source.forEach((p, i) => {
    const t = quad[i];
    matrix.push([p.x, p.y, 1, 0, 0, 0, -t.x * p.x, -t.x * p.y]); values.push(t.x);
    matrix.push([0, 0, 0, p.x, p.y, 1, -t.y * p.x, -t.y * p.y]); values.push(t.y);
  });
  return [...solve(matrix, values), 1] as Matrix3;
}

export function mapCalibratedPoint(h: Matrix3, x: number, y: number): CalibrationPoint {
  const divisor = h[6] * x + h[7] * y + h[8];
  if (Math.abs(divisor) < 1e-10) throw new Error("Niestabilna perspektywa.");
  return { x: (h[0] * x + h[1] * y + h[2]) / divisor, y: (h[3] * x + h[4] * y + h[5]) / divisor };
}

function triangle(ctx: CanvasRenderingContext2D, image: CanvasImageSource, s: CalibrationPoint[], d: CalibrationPoint[]) {
  const [a, b, c] = s, [p, q, r] = d;
  const det = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
  if (Math.abs(det) < 1e-10) return;
  const A = (p.x * (b.y - c.y) + q.x * (c.y - a.y) + r.x * (a.y - b.y)) / det;
  const B = (p.y * (b.y - c.y) + q.y * (c.y - a.y) + r.y * (a.y - b.y)) / det;
  const C = (p.x * (c.x - b.x) + q.x * (a.x - c.x) + r.x * (b.x - a.x)) / det;
  const D = (p.y * (c.x - b.x) + q.y * (a.x - c.x) + r.y * (b.x - a.x)) / det;
  const E = (p.x * (b.x * c.y - c.x * b.y) + q.x * (c.x * a.y - a.x * c.y) + r.x * (a.x * b.y - b.x * a.y)) / det;
  const F = (p.y * (b.x * c.y - c.x * b.y) + q.y * (c.x * a.y - a.x * c.y) + r.y * (a.x * b.y - b.x * a.y)) / det;
  ctx.save();
  // Extend clip by ~0.65px around centroid to mask subpixel seams.
  const cx = (p.x + q.x + r.x) / 3, cy = (p.y + q.y + r.y) / 3;
  ctx.beginPath();
  d.forEach((v, i) => {
    const dx = v.x - cx, dy = v.y - cy, length = Math.hypot(dx, dy) || 1;
    const x = v.x + dx / length * .65, y = v.y + dy / length * .65;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(A, B, C, D, E, F);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

/** Warps only a flat artwork image. Not a 3D building or structural projection. */
export function drawCalibratedSurface(
  ctx: CanvasRenderingContext2D,
  artwork: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  quad: CalibrationQuad,
  divisions = 18,
) {
  if (!validateCalibrationQuad(quad, ctx.canvas.width, ctx.canvas.height))
    throw new Error("Zaznacz cztery narożniki boiska po obwodzie: lewy górny, prawy górny, prawy dolny, lewy dolny.");
  const h = makeCalibrationHomography(sourceWidth, sourceHeight, quad);
  const steps = Math.max(4, Math.min(48, Math.trunc(divisions)));
  for (let row = 0; row < steps; row++) for (let col = 0; col < steps; col++) {
    const x0 = sourceWidth * col / steps, x1 = sourceWidth * (col + 1) / steps;
    const y0 = sourceHeight * row / steps, y1 = sourceHeight * (row + 1) / steps;
    const s00 = { x: x0, y: y0 }, s10 = { x: x1, y: y0 }, s11 = { x: x1, y: y1 }, s01 = { x: x0, y: y1 };
    const d00 = mapCalibratedPoint(h, x0, y0), d10 = mapCalibratedPoint(h, x1, y0);
    const d11 = mapCalibratedPoint(h, x1, y1), d01 = mapCalibratedPoint(h, x0, y1);
    triangle(ctx, artwork, [s00, s10, s11], [d00, d10, d11]);
    triangle(ctx, artwork, [s00, s11, s01], [d00, d11, d01]);
  }
}
