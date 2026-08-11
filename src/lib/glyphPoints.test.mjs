// node src/lib/glyphPoints.test.mjs
// Guards the two things that silently ship wrong: the canvas→world Y flip
// (an upside-down P still looks "designed") and the centring.
import assert from 'node:assert/strict';
import { glyphToWorld } from './glyphPoints.js';

const bbox = { minX: 0, maxX: 10, minY: 0, maxY: 10 };
const noJitter = { height: 2, depth: 0, rand: () => 0.5 };

// Top-of-canvas pixel must land at the TOP of the cloud.
const top = glyphToWorld({ filled: [5, 0], ...bbox }, 1, noJitter);
assert.equal(top[0], 0, 'centre column maps to x=0');
assert.equal(top[1], 1, 'canvas top maps to +Y');
assert.equal(top[2], 0, 'zero depth stays flat');

// ...and the bottom pixel at the bottom.
const bottom = glyphToWorld({ filled: [5, 10], ...bbox }, 1, noJitter);
assert.equal(bottom[1], -1, 'canvas bottom maps to -Y');

// Real sampling stays inside the requested height and sits on the origin.
const square = { filled: [], minX: 0, maxX: 20, minY: 0, maxY: 20 };
for (let y = 0; y <= 20; y++) for (let x = 0; x <= 20; x++) square.filled.push(x, y);

const cloud = glyphToWorld(square, 5000, { height: 3, depth: 0.5 });
// Sub-pixel jitter is allowed to overshoot the bbox by half a pixel.
const slack = (3 / 20) * 0.5;
let sumX = 0;
let sumY = 0;
for (let i = 0; i < 5000; i++) {
  assert.ok(Math.abs(cloud[i * 3 + 1]) <= 1.5 + slack, 'stays within height');
  assert.ok(Math.abs(cloud[i * 3 + 2]) <= 0.25 + 1e-6, 'stays within depth');
  sumX += cloud[i * 3];
  sumY += cloud[i * 3 + 1];
}
assert.ok(Math.abs(sumX / 5000) < 0.05, 'centred on X');
assert.ok(Math.abs(sumY / 5000) < 0.05, 'centred on Y');

console.log('glyphPoints ok');
