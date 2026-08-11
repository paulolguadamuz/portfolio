/**
 * Turn a text glyph into a 3D point cloud.
 *
 * Rasterising the letter in the real web font and sampling its opaque pixels
 * beats TextGeometry here: no typeface.json conversion step, no extra three.js
 * imports, and the cloud always matches whatever the font actually renders.
 */

/**
 * Rasterise `char` and collect its opaque pixels plus their bounding box.
 * Browser only. Returns null when the glyph renders empty.
 */
export function rasterizeGlyph(char, font, size = 320) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, size / 2, size / 2);

  const { data } = ctx.getImageData(0, 0, size, size);
  const filled = [];
  let minX = size;
  let maxX = 0;
  let minY = size;
  let maxY = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] < 128) continue;
      filled.push(x, y);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  return filled.length ? { filled, minX, maxX, minY, maxY } : null;
}

/**
 * Map rasterised pixels into world-space positions centred on the origin,
 * extruded into a slab on Z. Canvas Y grows downward and world Y grows up,
 * hence the flip.
 */
export function glyphToWorld(
  raster,
  count,
  { height = 2.6, depth = 0.42, rand = Math.random } = {}
) {
  const { filled, minX, maxX, minY, maxY } = raster;
  const n = filled.length / 2;
  const scale = height / Math.max(maxY - minY, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const p = Math.min((rand() * n) | 0, n - 1);
    // Sub-pixel jitter, otherwise the cloud snaps to a visible pixel lattice
    const px = filled[p * 2] + rand() - 0.5;
    const py = filled[p * 2 + 1] + rand() - 0.5;

    positions[i * 3] = (px - cx) * scale;
    positions[i * 3 + 1] = -(py - cy) * scale;
    positions[i * 3 + 2] = (rand() - 0.5) * depth;
  }

  return positions;
}
