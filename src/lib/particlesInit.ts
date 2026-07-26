import { loadSlim } from "@tsparticles/slim";
import { loadPolygonMaskPlugin } from "@tsparticles/plugin-polygon-mask";
import type { Engine } from "@tsparticles/engine";

export async function initParticlesEngine(engine: Engine) {
  await loadSlim(engine);
  await loadPolygonMaskPlugin(engine);
}
