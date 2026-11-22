// Screenshot staging module for Harbor Heat dossier generation.
import { STEP } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';

export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    for (let i = 0; i < 300; i++) {
      world.step(STEP, { steer: 0.1, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'end') {
    return { screen: SCREEN_OVER, best: 0 };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
