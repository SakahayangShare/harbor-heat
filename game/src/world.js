// City generation, world layout, entities (player, traffic, police, pedestrians, cash),
// physics, and collision logic for Harbor Heat. Logically pure with no DOM dependencies.

import { WORLD, BLOCK_SIZE, ROAD_WIDTH, PLAYER_CAR, MAX_HEALTH, MAX_WANTED } from './config.js';

export function createWorld(random) {
  const buildings = [];
  const traffic = [];
  const pedestrians = [];
  const police = [];
  const cashPickups = [];

  // Generate city grid (buildings and blocks)
  const cols = Math.floor(WORLD.width / (BLOCK_SIZE + ROAD_WIDTH));
  const rows = Math.floor(WORLD.height / (BLOCK_SIZE + ROAD_WIDTH));

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const bx = c * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2;
      const by = r * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2;
      const bWidth = BLOCK_SIZE;
      const bHeight = BLOCK_SIZE;

      // Add a building complex inside the block with sidewalks around
      const margin = 20;
      const colorIndex = Math.floor(random() * 6);
      buildings.push({
        x: bx + margin,
        y: by + margin,
        width: bWidth - margin * 2,
        height: bHeight - margin * 2,
        colorIndex,
      });
    }
  }

  const player = {
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    angle: 0,
    speed: 0,
    health: MAX_HEALTH,
    money: 500,
    wanted: 0,
    activeMission: 0, // 0: None, 1: Taxi, 2: Hot Wheels, 3: Heat, 4: The Drop, 5: Debt Paid
    missionProgress: 0,
    targetX: 0,
    targetY: 0,
  };

  function reset() {
    player.x = WORLD.width / 2 + 100;
    player.y = WORLD.height / 2 + 100;
    player.angle = 0;
    player.speed = 0;
    player.health = MAX_HEALTH;
    player.money = 500;
    player.wanted = 0;
    player.activeMission = 0;
    player.missionProgress = 0;

    traffic.length = 0;
    pedestrians.length = 0;
    police.length = 0;
    cashPickups.length = 0;

    // Spawn initial traffic cars
    for (let i = 0; i < 20; i++) {
      traffic.push({
        x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
        y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
        angle: random() > 0.5 ? 0 : Math.PI / 2,
        speed: 100 + random() * 150,
        type: Math.floor(random() * 3), // 0: sedan, 1: taxi, 2: sports
        width: 48,
        height: 26,
      });
    }

    // Spawn pedestrians
    for (let i = 0; i < 30; i++) {
      pedestrians.push({
        x: random() * WORLD.width,
        y: random() * WORLD.height,
        vx: (random() - 0.5) * 30,
        vy: (random() - 0.5) * 30,
      });
    }

    // Spawn initial cash drops around the city
    for (let i = 0; i < 15; i++) {
      cashPickups.push({
        x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
        y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
        value: 100 + Math.floor(random() * 400),
      });
    }
  }

  function checkBuildingCollision(nx, ny, width, height) {
    const hw = width / 2;
    const hh = height / 2;
    for (const b of buildings) {
      if (
        nx - hw < b.x + b.width &&
        nx + hw > b.x &&
        ny - hh < b.y + b.height &&
        ny + hh > b.y
      ) {
        return true;
      }
    }
    return false;
  }

  function step(dt, controls, harmless) {
    // Controls: { steer: -1..1, throttle: -1..1, brake: boolean, handbrake: boolean }
    if (!harmless) {
      // Player movement physics
      if (controls.throttle > 0) {
        player.speed = Math.min(PLAYER_CAR.maxSpeed, player.speed + PLAYER_CAR.accel * dt);
      } else if (controls.throttle < 0) {
        player.speed = Math.max(-PLAYER_CAR.reverseSpeed, player.speed - PLAYER_CAR.accel * dt);
      } else {
        if (player.speed > 0) {
          player.speed = Math.max(0, player.speed - PLAYER_CAR.friction * dt);
        } else if (player.speed < 0) {
          player.speed = Math.min(0, player.speed + PLAYER_CAR.friction * dt);
        }
      }

      if (controls.brake) {
        if (player.speed > 0) player.speed = Math.max(0, player.speed - PLAYER_CAR.brake * dt);
        else if (player.speed < 0) player.speed = Math.min(0, player.speed + PLAYER_CAR.brake * dt);
      }

      if (Math.abs(player.speed) > 10) {
        player.angle += controls.steer * PLAYER_CAR.turnSpeed * (player.speed / PLAYER_CAR.maxSpeed) * dt;
      }

      // Calculate next position
      const nx = player.x + Math.cos(player.angle) * player.speed * dt;
      const ny = player.y + Math.sin(player.angle) * player.speed * dt;

      // Boundary check & building collision check
      const clampedX = Math.max(50, Math.min(WORLD.width - 50, nx));
      const clampedY = Math.max(50, Math.min(WORLD.height - 50, ny));

      if (!checkBuildingCollision(clampedX, clampedY, PLAYER_CAR.width, PLAYER_CAR.height)) {
        player.x = clampedX;
        player.y = clampedY;
      } else {
        // Hit building -> bounce/slow down and take damage
        player.speed *= -0.3;
        player.health = Math.max(0, player.health - 2);
      }

      // Check cash pickups collection
      for (let i = cashPickups.length - 1; i >= 0; i--) {
        const cash = cashPickups[i];
        const dx = cash.x - player.x;
        const dy = cash.y - player.y;
        if (dx * dx + dy * dy < 40 * 40) {
          player.money += cash.value;
          cashPickups.splice(i, 1);
          // Respawn cash elsewhere
          cashPickups.push({
            x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
            y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
            value: 100 + Math.floor(random() * 400),
          });
        }
      }

      // Move traffic
      for (const t of traffic) {
        t.x += Math.cos(t.angle) * t.speed * dt;
        t.y += Math.sin(t.angle) * t.speed * dt;
        // Wrap around world
        if (t.x < 0) t.x = WORLD.width;
        if (t.x > WORLD.width) t.x = 0;
        if (t.y < 0) t.y = WORLD.height;
        if (t.y > WORLD.height) t.y = 0;

        // Check collision with player
        const pdx = t.x - player.x;
        const pdy = t.y - player.y;
        if (pdx * pdx + pdy * pdy < 40 * 40 && Math.abs(player.speed) > 100) {
          player.health = Math.max(0, player.health - 5);
          player.wanted = Math.min(MAX_WANTED, player.wanted + 1);
        }
      }

      // Move pedestrians
      for (const p of pedestrians) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > WORLD.width) p.vx *= -1;
        if (p.y < 0 || p.y > WORLD.height) p.vy *= -1;
      }
    } else {
      // Harmless backdrop movement for title screen
      player.x += 60 * dt;
      if (player.x > WORLD.width) player.x = 0;
    }
  }

  function getStateData() {
    return {
      x: player.x,
      y: player.y,
      money: player.money,
      health: player.health,
      wanted: player.wanted,
      activeMission: player.activeMission,
      missionProgress: player.missionProgress,
    };
  }

  function loadState(data) {
    if (!data) return;
    player.x = data.x ?? player.x;
    player.y = data.y ?? player.y;
    player.money = data.money ?? player.money;
    player.health = data.health ?? player.health;
    player.wanted = data.wanted ?? player.wanted;
    player.activeMission = data.activeMission ?? player.activeMission;
    player.missionProgress = data.missionProgress ?? player.missionProgress;
  }

  return {
    state: { player, buildings, traffic, pedestrians, police, cashPickups },
    reset,
    step,
    getStateData,
    loadState,
  };
}
