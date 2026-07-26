/**
 * Minimal GLB binary parser — no Three.js required, pure fetch + DataView.
 * Returns normalized [x,y] particle positions in [0,1] range.
 */
export async function loadGLBParticles(
  url: string,
  axisX: 0 | 1 | 2,   // which 3D axis to map to canvas X
  axisY: 0 | 1 | 2,   // which 3D axis to map to canvas Y
  flipY: boolean,
  maxPts: number,
  noise: number,
): Promise<Array<{ bx: number; by: number }>> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
  const buf = await resp.arrayBuffer();
  const view = new DataView(buf);

  // Validate GLB magic
  if (view.getUint32(0, true) !== 0x46546C67) throw new Error("Not a GLB file");

  // Parse JSON chunk
  const jsonLen  = view.getUint32(12, true);
  const jsonText = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen));
  const gltf     = JSON.parse(jsonText) as {
    accessors:   Array<{ type: string; componentType: number; count: number; bufferView: number; byteOffset?: number; min?: number[]; max?: number[] }>;
    bufferViews: Array<{ buffer: number; byteOffset?: number; byteLength: number; byteStride?: number }>;
  };

  const binStart = 20 + jsonLen + 8; // after header + JSON chunk + BIN chunk header

  // Collect all VEC3 float32 positions from all accessors
  const all3D: [number, number, number][] = [];

  for (const acc of (gltf.accessors ?? [])) {
    if (acc.type !== "VEC3" || acc.componentType !== 5126 /* float32 */) continue;
    const bv     = gltf.bufferViews[acc.bufferView];
    if (!bv) continue;
    const base   = binStart + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const stride = bv.byteStride ?? 12;

    for (let i = 0; i < acc.count; i++) {
      const off = base + i * stride;
      if (off + 11 >= buf.byteLength) break;
      all3D.push([
        view.getFloat32(off,     true),
        view.getFloat32(off + 4, true),
        view.getFloat32(off + 8, true),
      ]);
    }
  }

  if (!all3D.length) throw new Error("No VEC3 positions found in GLB");

  // Subsample
  const step = Math.max(1, Math.floor(all3D.length / maxPts));
  const pts  = all3D.filter((_, i) => i % step === 0);

  // Compute bounding box for the two chosen axes
  let minA =  Infinity, maxA = -Infinity;
  let minB =  Infinity, maxB = -Infinity;
  for (const p of pts) {
    if (p[axisX] < minA) minA = p[axisX];
    if (p[axisX] > maxA) maxA = p[axisX];
    if (p[axisY] < minB) minB = p[axisY];
    if (p[axisY] > maxB) maxB = p[axisY];
  }

  const pad   = 0.08;
  const rangeA = maxA - minA || 1;
  const rangeB = maxB - minB || 1;
  const range  = Math.max(rangeA, rangeB);
  const cA     = (minA + maxA) / 2;
  const cB     = (minB + maxB) / 2;

  return pts.map((p) => {
    const a = p[axisX], b = p[axisY];
    const nx = 0.5 + (a - cA) / range * (1 - 2 * pad) + (Math.random() - 0.5) * noise;
    const ny = 0.5 + (flipY ? -(b - cB) : (b - cB)) / range * (1 - 2 * pad) + (Math.random() - 0.5) * noise;
    return { bx: Math.max(0.01, Math.min(0.99, nx)), by: Math.max(0.01, Math.min(0.99, ny)) };
  });
}
