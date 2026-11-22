// Screenshot generator for Harbor Heat using @napi-rs/canvas.
// Runs the game logic in Node and renders frames to JPEG files.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';

// Shim browser environment
globalThis.window = globalThis;
globalThis.innerWidth = 1280;
globalThis.innerHeight = 720;
globalThis.document = {
  getElementById: (id) => {
    if (id === 'game') return canvas;
    return null;
  },
  addEventListener: () => {},
};
globalThis.addEventListener = () => {};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};
globalThis.performance = { now: () => Date.now() };
globalThis.URLSearchParams = class extends URLSearchParams {
  constructor(search) { super(search); }
};
globalThis.requestAnimationFrame = () => {};
globalThis.location = { search: '' };
try {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node' },
    configurable: true,
  });
} catch {}

const canvas = createCanvas(1280, 720);

// Import game modules
import { createRandom } from '../game/src/random.js';
import { createWorld } from '../game/src/world.js';
import { createRenderer } from '../game/src/render.js';
import { stageShot } from '../game/src/shots.js';

const scenes = [
  { name: '1-title.jpg', shot: 'title' },
  { name: '2-city.jpg', shot: 'city' },
  { name: '3-chase.jpg', shot: 'chase' },
  { name: '4-mission.jpg', shot: 'mission' },
];

mkdirSync('screenshots', { recursive: true });

async function takeShots() {
  const seed = 1;
  const renderer = createRenderer(canvas);

  for (const scene of scenes) {
    const world = createWorld(createRandom(seed));
    const staged = stageShot(scene.shot, world);

    renderer.draw(world.state, staged.screen, 0);

    const jpeg = await canvas.encode('jpeg', 85);
    const path = join('screenshots', scene.name);
    writeFileSync(path, jpeg);
    console.log(`Generated ${path} (${jpeg.length} bytes)`);
  }
}

takeShots().catch(console.error);
