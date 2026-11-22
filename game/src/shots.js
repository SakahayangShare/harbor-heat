// Screenshot staging module for Harbor Heat.
// Simulates the game world to specific points for dossier screenshots.

import { STEP, MAX_HEALTH } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';

export function stageShot(name, world) {
  world.reset();
  const player = world.state.player;

  if (name === 'city') {
    // Rico walking in city
    player.inVehicle = false;
    for (let i = 0; i < 180; i++) {
      world.step(STEP, { steer: 0.2, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'chase') {
    // Driving chased by police (3 stars)
    player.wanted = 3;
    player.speed = 350;
    for (let i = 0; i < 240; i++) {
      world.step(STEP, { steer: -0.1, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'mission') {
    // Mission active, driving toward objective
    player.activeMission = 1; // Taxi Fare
    for (let i = 0; i < 300; i++) {
      world.step(STEP, { steer: 0.1, throttle: 1, brake: false, interact: false, attack: false }, false);
    }
    return { screen: SCREEN_PLAY, best: 0 };
  } else if (name === 'title') {
    // Background movement for title
    for (let i = 0; i < 60; i++) {
      world.step(STEP, { steer: 0, throttle: 0, brake: false, interact: false, attack: false }, true);
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }

  return { screen: SCREEN_TITLE, best: 0 };
}
