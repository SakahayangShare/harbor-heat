// Screenshot staging module for Harbor Heat.
// Simulates the game world to specific points for dossier screenshots.

import { STEP, WORLD } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY } from './render.js';

export function stageShot(name, world) {
  world.reset();
  const player = world.state.player;

  if (name === 'city') {
    // Downtown intersection staging: position player at center intersection with traffic and pedestrians in frame
    player.x = WORLD.width / 2;
    player.y = WORLD.height / 2;
    player.inVehicle = true;
    player.speed = 0;

    // Ensure traffic cars and pedestrians are close in frame
    world.state.traffic.length = 0;
    world.state.traffic.push(
      { x: player.x + 120, y: player.y - 80, angle: 0, speed: 100, color: '#38bdf8' },
      { x: player.x - 140, y: player.y + 100, angle: Math.PI, speed: 90, color: '#10b981' }
    );
    world.state.pedestrians.push(
      { x: player.x + 70, y: player.y + 50, vx: 10, vy: 10, knockedOut: false },
      { x: player.x - 80, y: player.y - 60, vx: -10, vy: 10, knockedOut: false }
    );

    for (let i = 0; i < 15; i++) {
      world.step(STEP, { steer: 0, throttle: 0, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };

  } else if (name === 'chase') {
    // Chase staging: 3 stars wanted, 2 police cars right behind player car
    player.x = WORLD.width / 2 + 200;
    player.y = WORLD.height / 2 + 200;
    player.wanted = 3;
    player.speed = 380;
    player.angle = 0.2;
    player.inVehicle = true;

    world.state.police.length = 0;
    world.state.police.push(
      { x: player.x - 80, y: player.y - 30, speed: 400, width: 56, height: 30, inCar: true, angle: 0.2 },
      { x: player.x - 130, y: player.y + 40, speed: 390, width: 56, height: 30, inCar: true, angle: 0.25 }
    );

    for (let i = 0; i < 20; i++) {
      world.step(STEP, { steer: 0.05, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };

  } else if (name === 'mission') {
    // Mission staging: active mission with visible marker
    player.x = WORLD.width / 2 - 100;
    player.y = WORLD.height / 2 - 100;
    player.inVehicle = true;
    player.speed = 150;
    player.activeMission = 1;

    for (let i = 0; i < 30; i++) {
      world.step(STEP, { steer: 0, throttle: 0.5, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };

  } else if (name === 'title') {
    for (let i = 0; i < 30; i++) {
      world.step(STEP, { steer: 0, throttle: 1, brake: false, interact: false, attack: true }, true);
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }

  return { screen: SCREEN_TITLE, best: 0 };
}
