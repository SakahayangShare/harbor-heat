// City generation, world layout, entities (player, traffic, police, pedestrians, cash, parked cars),
// physics, and collision logic for Harbor Heat. Logically pure with no DOM dependencies.

import { WORLD, BLOCK_SIZE, ROAD_WIDTH, PLAYER_CAR, MAX_HEALTH, MAX_WANTED } from './config.js';
import { createVehicleManager, VEHICLE_MODELS } from './vehicles.js';

export function createWorld(random) {
  const buildings = [];
  const pedestrians = [];
  const police = [];
  const cashPickups = [];
  const vehicleManager = createVehicleManager(random);

  // Generate city grid (buildings and blocks with beach in south)
  const cols = Math.floor(WORLD.width / (BLOCK_SIZE + ROAD_WIDTH));
  const rows = Math.floor(WORLD.height / (BLOCK_SIZE + ROAD_WIDTH));

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const bx = c * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2;
      const by = r * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2;
      const bWidth = BLOCK_SIZE;
      const bHeight = BLOCK_SIZE;

      // South rows are beach/ocean area
      if (r >= rows - 2) continue;

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
    inVehicle: true,
    vehicleModel: VEHICLE_MODELS[0],
    activeMission: 0,
    missionProgress: 0,
  };

  function reset() {
    player.x = WORLD.width / 2 + 100;
    player.y = WORLD.height / 2 + 100;
    player.angle = 0;
    player.speed = 0;
    player.health = MAX_HEALTH;
    player.money = 500;
    player.wanted = 0;
    player.inVehicle = true;
    player.vehicleModel = VEHICLE_MODELS[0];
    player.activeMission = 0;
    player.missionProgress = 0;

    pedestrians.length = 0;
    police.length = 0;
    cashPickups.length = 0;

    vehicleManager.spawnTraffic();
    vehicleManager.spawnParkedCars();

    // Spawn pedestrians on sidewalks
    for (let i = 0; i < 40; i++) {
      pedestrians.push({
        x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
        y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
        vx: (random() - 0.5) * 25,
        vy: (random() - 0.5) * 25,
        panicked: false,
      });
    }

    // Spawn initial cash drops
    for (let i = 0; i < 20; i++) {
      cashPickups.push({
        x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
        y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
        value: 150 + Math.floor(random() * 350),
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
    if (!harmless) {
      // Enter / Exit vehicle toggle (E key / action)
      if (controls.interact && !player.inVehicle) {
        // Check if near a parked car
        for (const car of vehicleManager.parkedCars) {
          const dx = car.x - player.x;
          const dy = car.y - player.y;
          if (dx * dx + dy * dy < 60 * 60) {
            player.inVehicle = true;
            player.vehicleModel = car.model;
            player.x = car.x;
            player.y = car.y;
            player.wanted = Math.min(3, player.wanted + 1); // Stealing is a crime!
            break;
          }
        }
      }

      // Player driving physics
      const maxSpeed = player.inVehicle ? player.vehicleModel.maxSpeed : 180;
      const accel = player.inVehicle ? player.vehicleModel.accel : 200;
      const turnSpeed = player.inVehicle ? player.vehicleModel.turnSpeed : 4.0;

      if (controls.throttle > 0) {
        player.speed = Math.min(maxSpeed, player.speed + accel * dt);
      } else if (controls.throttle < 0) {
        player.speed = Math.max(-120, player.speed - accel * dt);
      } else {
        if (player.speed > 0) player.speed = Math.max(0, player.speed - PLAYER_CAR.friction * dt);
        else if (player.speed < 0) player.speed = Math.min(0, player.speed + PLAYER_CAR.friction * dt);
      }

      if (controls.brake) {
        if (player.speed > 0) player.speed = Math.max(0, player.speed - PLAYER_CAR.brake * dt);
        else if (player.speed < 0) player.speed = Math.min(0, player.speed + PLAYER_CAR.brake * dt);
      }

      if (Math.abs(player.speed) > 5) {
        player.angle += controls.steer * turnSpeed * (player.speed / maxSpeed) * dt;
      }

      const nx = player.x + Math.cos(player.angle) * player.speed * dt;
      const ny = player.y + Math.sin(player.angle) * player.speed * dt;

      const clampedX = Math.max(50, Math.min(WORLD.width - 50, nx));
      const clampedY = Math.max(50, Math.min(WORLD.height - 50, ny));

      if (!checkBuildingCollision(clampedX, clampedY, PLAYER_CAR.width, PLAYER_CAR.height)) {
        player.x = clampedX;
        player.y = clampedY;
      } else {
        player.speed *= -0.3;
        player.health = Math.max(0, player.health - 3);
      }

      // Update traffic
      vehicleManager.updateTraffic(dt, buildings, player);

      // Check cash pickups
      for (let i = cashPickups.length - 1; i >= 0; i--) {
        const cash = cashPickups[i];
        const dx = cash.x - player.x;
        const dy = cash.y - player.y;
        if (dx * dx + dy * dy < 45 * 45) {
          player.money += cash.value;
          cashPickups.splice(i, 1);
          cashPickups.push({
            x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
            y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
            value: 150 + Math.floor(random() * 350),
          });
        }
      }

      // Pedestrians movement and panic
      for (const p of pedestrians) {
        if (player.wanted > 0 || Math.abs(player.speed) > 200) {
          const pdx = p.x - player.x;
          const pdy = p.y - player.y;
          if (pdx * pdx + pdy * pdy < 120 * 120) {
            p.panicked = true;
            p.vx = (pdx > 0 ? 1 : -1) * 80;
            p.vy = (pdy > 0 ? 1 : -1) * 80;
          }
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0 || p.x > WORLD.width) p.vx *= -1;
        if (p.y < 0 || p.y > WORLD.height) p.vy *= -1;
      }
    } else {
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
    state: {
      player,
      buildings,
      traffic: vehicleManager.traffic,
      parkedCars: vehicleManager.parkedCars,
      pedestrians,
      police,
      cashPickups,
    },
    reset,
    step,
    getStateData,
    loadState,
  };
}
