// Main entry point and game loop for Harbor Heat (Porto Azul).
// Manages state machine (title, play, paused, over, victory), fixed-timestep updates, input, and rendering.

import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createInput, ACTION_CONFIRM, ACTION_PAUSE } from './input.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_OVER, SCREEN_VICTORY } from './render.js';
import { createAudio } from './audio.js';
import { saveProgress, loadProgress } from './save.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const input = createInput(canvas);
const audio = createAudio();

if (shot) {
  const scene = stageShot(shot, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, 0);
    painted++;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
} else {
  runGame();
}

function runGame() {
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();

  function startGame(continueGame = false) {
    if (continueGame) {
      const saved = loadProgress();
      if (saved) world.loadState(saved);
      else world.reset();
    } else {
      world.reset();
    }
    accumulator = 0;
    screen = SCREEN_PLAY;
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      startGame(screen === SCREEN_TITLE && loadProgress() !== null);
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
    }
  }

  function step(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;

    handleActions();

    if (screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP) {
        world.step(STEP, input.getControls(), false);
        accumulator -= STEP;
      }
      saveProgress(world.getStateData());

      if (world.state.missionState === 'victory') {
        screen = SCREEN_VICTORY;
      } else if (world.state.player.health <= 0) {
        screen = SCREEN_OVER;
      }
    } else if (screen === SCREEN_TITLE) {
      world.step(STEP, { steer: 0, throttle: 1, brake: false, interact: false, attack: false }, true);
    }

    renderer.draw(world.state, screen, 0);
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
