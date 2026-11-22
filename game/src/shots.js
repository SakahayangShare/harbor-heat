// Screenshot staging module for Harbor Heat.
// Simulates the game world to specific points for dossier screenshots.

import { STEP } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY } from './render.js';

export function stageShot(name, world) {
  world.reset();
  const player = world.state.player;

  if (name === 'city') {
    player.inVehicle = false;
    player.x = world.state.buildings[0].x + 100;
    player.y = world.state.buildings[0].y + 100;
    for (let i = 0; i < 60; i++) {
      world.step(STEP, { steer: 0, throttle: 0, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'chase') {
    player.wanted = 3;
    player.speed = 400;
    // Force spawn police right near player for clear visual in screenshot
    world.state.police.push(
      { x: player.x + 90, y: player.y + 60, speed: 420, width: 56, height: 30, inCar: true, angle: 0 },
      { x: player.x - 100, y: player.y - 80, speed: 410, width: 56, height: 30, inCar: true, angle: Math.PI / 2 }
    );
    for (let i = 0; i < 30; i++) {
      world.step(STEP, { steer: 0.1, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'mission') {
    player.activeMission = 1;
    for (let i = 0; i < 60; i++) {
      world.step(STEP, { steer: 0, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'title') {
    for (let i = 0; i < 30; i++) {
      world.step(STEP, { steer: 0, throttle: 1, brake: false, interact: false, attack: false }, true);
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }

  return { screen: SCREEN_TITLE, best: 0 };
}
