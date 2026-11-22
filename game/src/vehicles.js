// Vehicle system, traffic AI, driving physics, enter/exit car logic, and collisions for Harbor Heat.
// Logically pure, zero DOM access.

import { WORLD, BLOCK_SIZE, ROAD_WIDTH, MAX_HEALTH, MAX_WANTED } from './config.js';

export const VEHICLE_MODELS = [
  { name: 'Sedan', maxSpeed: 420, accel: 280, turnSpeed: 3.2, color: '#475569', health: 100 },
  { name: 'Taxi', maxSpeed: 400, accel: 300, turnSpeed: 3.4, color: '#f59e0b', health: 90 },
  { name: 'Sports', maxSpeed: 560, accel: 420, turnSpeed: 4.2, color: '#10b981', health: 80 },
  { name: 'Police', maxSpeed: 520, accel: 390, turnSpeed: 3.9, color: '#3b82f6', health: 130 },
];

export function createVehicleManager(random) {
  const traffic = [];
  const parkedCars = [];

  function spawnTraffic() {
    traffic.length = 0;
    for (let i = 0; i < 25; i++) {
      const modelIndex = Math.floor(random() * VEHICLE_MODELS.length);
      const model = VEHICLE_MODELS[modelIndex];
      const isHorizontal = random() > 0.5;
      traffic.push({
        x: ROAD_WIDTH + random() * (WORLD.width - ROAD_WIDTH * 2),
        y: ROAD_WIDTH + random() * (WORLD.height - ROAD_WIDTH * 2),
        angle: isHorizontal ? (random() > 0.5 ? 0 : Math.PI) : (random() > 0.5 ? Math.PI / 2 : -Math.PI / 2),
        speed: 120 + random() * 140,
        modelIndex,
        model,
        width: 48,
        height: 26,
        steering: 0,
      });
    }
  }

  function spawnParkedCars() {
    parkedCars.length = 0;
    const cols = Math.floor(WORLD.width / (BLOCK_SIZE + ROAD_WIDTH));
    const rows = Math.floor(WORLD.height / (BLOCK_SIZE + ROAD_WIDTH));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (random() > 0.6) {
          const bx = c * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2 + 50;
          const by = r * (BLOCK_SIZE + ROAD_WIDTH) + ROAD_WIDTH / 2 + 50;
          const modelIndex = Math.floor(random() * VEHICLE_MODELS.length);
          parkedCars.push({
            x: bx + random() * (BLOCK_SIZE - 100),
            y: by + random() * (BLOCK_SIZE - 100),
            angle: random() * Math.PI * 2,
            modelIndex,
            model: VEHICLE_MODELS[modelIndex],
            width: 48,
            height: 26,
            stealsCount: 0,
          });
        }
      }
    }
  }

  function updateTraffic(dt, buildings, player) {
    for (const car of traffic) {
      // Simple AI movement along roads with obstacle avoidance
      car.x += Math.cos(car.angle) * car.speed * dt;
      car.y += Math.sin(car.angle) * car.speed * dt;

      // Wrap around world borders
      if (car.x < 0) car.x = WORLD.width;
      if (car.x > WORLD.width) car.x = 0;
      if (car.y < 0) car.y = WORLD.height;
      if (car.y > WORLD.height) car.y = 0;

      // Simple turn at intersections or boundaries
      for (const b of buildings) {
        if (
          car.x > b.x && car.x < b.x + b.width &&
          car.y > b.y && car.y < b.y + b.height
        ) {
          car.angle += Math.PI / 2;
          car.x += Math.cos(car.angle) * 20;
          car.y += Math.sin(car.angle) * 20;
          break;
        }
      }
    }
  }

  return {
    traffic,
    parkedCars,
    spawnTraffic,
    spawnParkedCars,
    updateTraffic,
  };
}
