/**
 * Ported from hackathon.mintrans.uz — noise-driven particle generators.
 * Uses golden-ratio quasi-random sequences for well-distributed particles
 * along outline edges + filled interior + wheels/extras.
 */

const PI2 = Math.PI * 2;
const PHI1 = 0.7548776662;
const PHI2 = 0.5698402909;
const PHI3 = 0.312468134;
const PHI4 = 0.618033988;

interface Pt3 { x: number; y: number; z: number }

// Extra region generator helper
function m(
  x: number, y: number, z: number,
  r: number, i: number,
  axis: "x" | "y" | "z",
  o: number, s: number, rand: boolean
): Pt3 {
  const l = s * PHI1 % 1 * PI2;
  const u = rand ? r * (0.72 + 0.28 * (s * 0.312 % 1)) : r;
  const d = o * i;
  const f = Math.cos(l) * u;
  const p = Math.sin(l) * u;
  if (axis === "x") return { x: x + d, y: y + f, z: z + p };
  if (axis === "y") return { x: x + f, y: y + d, z: z + p };
  return { x: x + f, y: y + p, z: z + d };
}

type ExtraFn = (e: number, r: number, c: number, t: number) => Pt3;

// Generic outline + fill shape generator (from mintrans.uz)
function h(
  count: number,
  outline: [number, number][],
  depth: number,
  opts: {
    wheels?: [number, number][];
    wr?: number;
    wFrac?: number;
    rimFrac?: number;
    extras?: Array<{ frac: number; f: ExtraFn }>;
    S?: number;
    yShift?: number;
  }
): Pt3[] {
  const wheels  = opts.wheels  ?? [];
  const wr      = opts.wr     ?? 0.2;
  const wFrac   = wheels.length ? (opts.wFrac ?? 0.18) : 0;
  const rimFrac = opts.rimFrac ?? 0.4;
  const extras  = opts.extras  ?? [];
  const S       = opts.S      ?? 1;
  const yShift  = opts.yShift ?? 0;

  const extrasFrac = extras.reduce((a, e) => a + e.frac, 0);
  const outlineFrac = Math.max(0.05, 1 - wFrac - extrasFrac);

  // Compute centroid
  let cx = 0, cy = 0;
  for (const p of outline) { cx += p[0]; cy += p[1]; }
  cx /= outline.length; cy /= outline.length;

  // Edges: lengths + total length
  const edges: { a: [number,number]; b: [number,number]; len: number }[] = [];
  let totalLen = 0;
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    edges.push({ a, b, len });
    totalLen += len;
  }

  // Triangles for fill (fan from centroid)
  const tris: { b: [number,number]; c: [number,number]; ar: number }[] = [];
  let totalArea = 0;
  for (let i = 0; i < outline.length; i++) {
    const b = outline[i];
    const c = outline[(i + 1) % outline.length];
    const ar = Math.abs((b[0] - cx) * (c[1] - cy) - (c[0] - cx) * (b[1] - cy)) * 0.5;
    tris.push({ b, c, ar });
    totalArea += ar;
  }

  const result: Pt3[] = Array(count);

  for (let t = 0; t < count; t++) {
    const e = t * PHI1 % 1;
    const r = t * PHI2 % 1;
    const cc = t * PHI3 % 1;
    const x = t * PHI4 % 1;
    let pt: Pt3 = { x: 0, y: 0, z: 0 };

    if (x < wFrac && wheels.length) {
      // Wheel particle
      const wheel = wheels[Math.floor(cc * wheels.length) % wheels.length];
      const angle = e * PI2;
      const rad   = wr * Math.sqrt(0.14 + 0.86 * r);
      const side  = (t % 2 === 0 ? 1 : -1) * (depth + 0.02);
      pt = { x: wheel[0] + Math.cos(angle) * rad, y: wheel[1] + Math.sin(angle) * rad, z: side };
    } else {
      let selector = x - wFrac;
      let found = false;

      for (const ex of extras) {
        if (selector < ex.frac) {
          pt = ex.f(e, r, cc, t);
          found = true;
          break;
        }
        selector -= ex.frac;
      }

      if (!found && selector < outlineFrac * rimFrac) {
        // Outline edge
        let dist = selector / (outlineFrac * rimFrac) * totalLen;
        let edge = edges[0];
        for (const eg of edges) {
          if (dist < eg.len) { edge = eg; break; }
          dist -= eg.len;
        }
        const along = edge.len > 0 ? Math.min(dist / edge.len, 1) : 0;
        pt = {
          x: edge.a[0] + (edge.b[0] - edge.a[0]) * along,
          y: edge.a[1] + (edge.b[1] - edge.a[1]) * along,
          z: (r * 2 - 1) * depth,
        };
      } else if (!found) {
        // Fill (barycentric in triangulated area)
        let area = e * totalArea;
        let tri = tris[0];
        for (const tr of tris) {
          if (area < tr.ar) { tri = tr; break; }
          area -= tr.ar;
        }
        let br = r, bs = cc;
        if (br + bs > 1) { br = 1 - br; bs = 1 - bs; }
        pt = {
          x: cx + (tri.b[0] - cx) * br + (tri.c[0] - cx) * bs,
          y: cy + (tri.b[1] - cy) * br + (tri.c[1] - cy) * bs,
          z: t % 2 === 0 ? depth : -depth,
        };
      }
    }

    result[t] = { x: pt.x * S, y: (pt.y - yShift) * S, z: pt.z * S };
  }

  return result;
}

// ── CAR (from mintrans.uz g() function) ──────────────────────────────────
export function buildCarParticles(count: number): Pt3[] {
  return h(count, [
    [1.06, -0.02], [1, 0.1], [0.66, 0.15], [0.44, 0.17], [0.2, 0.42],
    [-0.3, 0.43], [-0.6, 0.19], [-0.92, 0.14], [-1.06, 0.03],
    [-1.06, -0.16], [-0.72, -0.2], [0.7, -0.2], [1.06, -0.16],
  ], 0.4, {
    wheels:  [[0.6, -0.17], [-0.64, -0.17]],
    wr:      0.25,
    wFrac:   0.18,
    rimFrac: 0.4,
    S:       1.2,
    yShift:  0.1,
  });
}

// ── AIRPLANE (from mintrans.uz _() function) ──────────────────────────────
export function buildPlaneParticles(count: number): Pt3[] {
  const scale = 1.02;
  const result: Pt3[] = [];

  const bary = (
    A: [number,number], B: [number,number], C: [number,number],
    r: number, s: number, depth: number, t: number
  ): Pt3 => {
    let br = r, bs = s;
    if (br + bs > 1) { br = 1 - br; bs = 1 - bs; }
    return {
      x: A[0] + (B[0] - A[0]) * br + (C[0] - A[0]) * bs,
      y: A[1] + (B[1] - A[1]) * br + (C[1] - A[1]) * bs,
      z: t % 2 === 0 ? depth : -depth,
    };
  };

  // Loop until we collect exactly `count` particles.
  // Wing particles whose |z| < 0.20 (inside the fuselage body) are skipped.
  for (let a = 0; result.length < count; a++) {
    const e  = a * PHI1 % 1;
    const r  = a * PHI2 % 1;
    const s  = a * PHI4 % 1;
    let pt: Pt3;

    if (s < 0.3) {
      // Fuselage cylinder surface
      const nx  = e * 2 - 1;
      const rad = 0.15 * Math.sqrt(Math.max(0.03, 1 - Math.abs(nx) ** 2.4 * 0.96));
      const ang = r * PI2;
      pt = { x: nx * 1.18, y: Math.cos(ang) * rad, z: Math.sin(ang) * rad };
    } else if (s < 0.66) {
      // Wing — skip particles too close to fuselage (body junction gap)
      const amp = r;
      const ox  = e * (0.13 + amp * 0.98);
      if (ox < 0.20) continue;                     // ← inside body region, skip
      const side = a % 2 === 0 ? 1 : -1;
      pt = {
        x: 0.4 - amp * 0.8 - e * (0.6 - amp * 0.44),
        y: (a % 2 === 0 ? 0.02 : -0.02),
        z: side * ox,
      };
    } else if (s < 0.80) {
      // Tail
      const side = a % 2 === 0 ? 1 : -1;
      pt = { x: -0.86 - e * 0.2 - r * (0.26 - e * 0.14), y: 0.04 + (a % 2 ? 0.015 : -0.015), z: side * (0.05 + e * 0.34) };
    } else {
      // Tail fin
      pt = bary([-0.78, 0.13], [-1.06, 0.13], [-1.06, 0.52], e, r, 0.02, a);
    }

    result.push({ x: pt.x * scale, y: pt.y * scale, z: pt.z * scale });
  }

  return result;
}

// Pre-compute k nearest neighbours for each particle (run once at module init).
// Returns NEIGHBORS[i] = sorted array of j indices, closest first.
export function buildKNearest(
  parts: Array<{ bx: number; by: number }>,
  k: number
): number[][] {
  const n = parts.length;
  const neighbors: number[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const dists: Array<{ j: number; d2: number }> = [];
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const dx = parts[i].bx - parts[j].bx;
      const dy = parts[i].by - parts[j].by;
      dists.push({ j, d2: dx * dx + dy * dy });
    }
    dists.sort((a, b) => a.d2 - b.d2);
    neighbors[i] = dists.slice(0, k).map(d => d.j);
  }
  return neighbors;
}

// Convert 3D particles to normalized [0,1] canvas coords
export function projectTo2D(
  pts: Pt3[],
  axisH: "x" | "y" | "z",  // 3D axis → canvas X
  axisV: "x" | "y" | "z",  // 3D axis → canvas Y
  flipV = false,
  pad = 0.08
): Array<{ bx: number; by: number }> {
  const as = pts.map(p => p[axisH]);
  const bs = pts.map(p => p[axisV]);
  const minA = Math.min(...as), maxA = Math.max(...as);
  const minB = Math.min(...bs), maxB = Math.max(...bs);
  const range = Math.max(maxA - minA, maxB - minB) || 1;
  const cA = (minA + maxA) / 2, cB = (minB + maxB) / 2;
  const scale = 1 - 2 * pad;

  return pts.map(p => ({
    bx: Math.max(0.01, Math.min(0.99, 0.5 + (p[axisH] - cA) / range * scale)),
    by: Math.max(0.01, Math.min(0.99, 0.5 + (flipV ? -(p[axisV] - cB) : (p[axisV] - cB)) / range * scale)),
  }));
}
