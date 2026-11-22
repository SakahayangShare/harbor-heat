// Actors module for Harbor Heat: Pedestrians, Police AI, Wanted Level, Busted & Wasted mechanics.
// Pure logic, zero DOM access.

import { WORLD, MAX_WANTED } from './config.js';

export function createActorsManager(random) {
  const policeUnits = [];

  function spawnPolice(player, wantedLevel) {
    if (wantedLevel <= 0) {
      policeUnits.length = 0;
      return;
    }
    // Ensure police count matches wanted level
    while (policeUnits.length < wantedLevel * 3) {
      const angle = random() * Math.PI * 2;
      const dist = 400 + random() * 300;
      policeUnits.push({
        x: player.x + Math.cos(angle) * dist,
        y: player.y + Math.sin(angle) * dist,
        speed: 240 + wantedLevel * 40,
        width: 48,
        height: 26,
        inCar: true,
      });
    }
  }

  function updatePolice(dt, player, buildings) {
    if (player.wanted <= 0) {
      policeUnits.length = 0;
      return;
    }

    spawnPolice(player, player.wanted);

    for (const p of policeUnits) {
      // Chase player
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const targetAngle = Math.atan2(dy, dx);
        p.x += Math.cos(targetAngle) * p.speed * dt;
        p.y += Math.sin(targetAngle) * p.speed * dt;
      }

      // Check if police busts player (close proximity and low speed)
      if (dist < 50 && Math.abs(player.speed) < 50) {
        player.bustedTimer = (player.bustedTimer || 0) + dt;
        if (player.bustedTimer > 2.0) {
          // Busted!
          player.money = Math.max(0, player.money - 300);
          player.wanted = 0;
          player.health = 100;
          player.x = WORLD.width / 2;
          player.y = WORLD.height / 2;
          player.bustedTimer = 0;
        }
      } else {
        player.bustedTimer = Math.max(0, (player.bustedTimer || 0) - dt * 0.5);
      }
    }
  }

  return {
    policeUnits,
    spawnPolice,
    updatePolice,
  };
}
