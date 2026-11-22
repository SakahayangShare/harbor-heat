// Canvas 2D rendering engine for Harbor Heat (Porto Azul).
// Brighter, high-contrast visuals: detailed top-down cars, vibrant buildings, ocean, beach, park, HUD, and minimap.

import { WORLD, BLOCK_SIZE, ROAD_WIDTH, FONT, PALETTE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_VICTORY = 'victory';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, width: 1280, height: 720 };

  function resize() {
    canvas.width = window.innerWidth || 1280;
    canvas.height = window.innerHeight || 720;
    view.width = canvas.width;
    view.height = canvas.height;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawCar(x, y, angle, color, isPolice = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Car body chassis
    ctx.fillStyle = isPolice ? '#0f172a' : color;
    ctx.fillRect(-28, -15, 56, 30);

    // Police side stripes
    if (isPolice) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -15, 20, 30);
    }

    // Roof cabin
    ctx.fillStyle = isPolice ? '#334155' : '#1e293b';
    ctx.fillRect(-14, -11, 28, 22);

    // Windshield & Rear glass
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(4, -10, 8, 20); // Front windshield
    ctx.fillStyle = '#475569';
    ctx.fillRect(-12, -10, 6, 20); // Rear glass

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(26, -12, 3, 6);
    ctx.fillRect(26, 6, 3, 6);

    // Police lightbar
    if (isPolice) {
      ctx.fillStyle = '#ef4444'; // Red
      ctx.fillRect(-4, -8, 8, 6);
      ctx.fillStyle = '#3b82f6'; // Blue
      ctx.fillRect(-4, 2, 8, 6);
    }

    ctx.restore();
  }

  function drawWorld(state) {
    ctx.save();
    const player = state.player;
    const cx = view.width / 2 - player.x;
    const cy = view.height / 2 - player.y;

    ctx.translate(cx, cy);

    // World Background & Ocean in South
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Ocean & Beach in south
    ctx.fillStyle = '#0284c7'; // Bright blue ocean
    ctx.fillRect(0, WORLD.height - 900, WORLD.width, 900);
    ctx.fillStyle = '#fef08a'; // Bright sandy beach
    ctx.fillRect(0, WORLD.height - 1020, WORLD.width, 120);

    // Roads grid
    ctx.fillStyle = PALETTE.road;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Road lane markings
    ctx.strokeStyle = PALETTE.roadLine;
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    // Draw grid lines along roads
    for (let x = BLOCK_SIZE + ROAD_WIDTH; x < WORLD.width; x += BLOCK_SIZE + ROAD_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(x - ROAD_WIDTH / 2, 0);
      ctx.lineTo(x - ROAD_WIDTH / 2, WORLD.height);
      ctx.stroke();
    }
    for (let y = BLOCK_SIZE + ROAD_WIDTH; y < WORLD.height; y += BLOCK_SIZE + ROAD_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(0, y - ROAD_WIDTH / 2);
      ctx.lineTo(WORLD.width, y - ROAD_WIDTH / 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Sidewalks around blocks
    ctx.fillStyle = PALETTE.sidewalk;
    for (const b of state.buildings) {
      ctx.fillRect(b.x - 12, b.y - 12, b.width + 24, b.height + 24);
    }

    // Buildings
    for (const b of state.buildings) {
      ctx.fillStyle = PALETTE.building[b.colorIndex % PALETTE.building.length];
      ctx.fillRect(b.x, b.y, b.width, b.height);
      // Roof inner structure
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(b.x + 20, b.y + 20, b.width - 40, b.height - 40);
    }

    // Cash Pickups
    for (const cash of state.cashPickups) {
      ctx.fillStyle = PALETTE.cash;
      ctx.beginPath();
      ctx.arc(cash.x, cash.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Parked Cars
    for (const car of state.parkedCars) {
      drawCar(car.x, car.y, car.angle, car.model.color, false);
    }

    // Traffic Cars
    for (const car of state.traffic) {
      drawCar(car.x, car.y, car.angle, '#64748b', false);
    }

    // Police Units
    for (const p of state.police) {
      drawCar(p.x, p.y, p.angle || 0, '#3b82f6', true);
    }

    // Pedestrians
    for (const ped of state.pedestrians) {
      ctx.fillStyle = ped.knockedOut ? '#64748b' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(ped.x, ped.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Player
    if (player.inVehicle) {
      drawCar(player.x, player.y, player.angle, player.vehicleModel.color, false);
    } else {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Mission marker waypoint (Yellow glowing circle)
    const mission = state.currentMission;
    if (mission) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.arc(mission.targetX, mission.targetY, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.marker;
      ctx.beginPath();
      ctx.arc(mission.targetX, mission.targetY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold 20px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', mission.targetX, mission.targetY);
    }

    ctx.restore();
  }

  function drawHud(state) {
    const player = state.player;
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(25, 25, 380, 140);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 380, 140);

    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(`Money: $${player.money}`, 45, 40);
    ctx.fillText(`Health: ${Math.max(0, Math.round(player.health))}%`, 45, 70);
    ctx.fillText(`Wanted: ${'★'.repeat(player.wanted)}${'☆'.repeat(3 - player.wanted)}`, 45, 100);

    const mission = state.currentMission;
    if (mission) {
      const dist = Math.round(player.missionDistance || 0);
      ctx.fillStyle = PALETTE.marker;
      ctx.fillText(`Objective: ${mission.title} (${dist}m)`, 45, 130);
    }

    const speedKmh = Math.round(Math.abs(player.speed) * 0.8);
    ctx.fillStyle = PALETTE.text;
    ctx.textAlign = 'right';
    ctx.fillText(`${speedKmh} km/h`, view.width - 45, 40);

    drawMinimap(state);
  }

  function drawMinimap(state) {
    const mapSize = 180;
    const mapX = view.width - mapSize - 25;
    const mapY = 25;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    const scale = mapSize / WORLD.width;
    const player = state.player;

    ctx.fillStyle = '#475569';
    for (const b of state.buildings) {
      ctx.fillRect(mapX + b.x * scale, mapY + b.y * scale, b.width * scale, b.height * scale);
    }

    ctx.fillStyle = PALETTE.player;
    ctx.beginPath();
    ctx.arc(mapX + player.x * scale, mapY + player.y * scale, 5, 0, Math.PI * 2);
    ctx.fill();

    const mission = state.currentMission;
    if (mission) {
      ctx.fillStyle = PALETTE.marker;
      ctx.beginPath();
      ctx.arc(mapX + mission.targetX * scale, mapY + mission.targetY * scale, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPanel(title, lines, prompt) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    const pw = 640;
    const ph = 280 + lines.length * 35;
    const px = (view.width - pw) / 2;
    const py = (view.height - ph) / 2;

    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 32px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, view.width / 2, py + 35);

    ctx.font = `20px ${FONT}`;
    let ly = py + 95;
    for (const line of lines) {
      ctx.fillText(line, view.width / 2, ly);
      ly += 35;
    }

    ctx.fillStyle = PALETTE.marker;
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(prompt, view.width / 2, py + ph - 55);
  }

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, view.width, view.height);

    if (screen === SCREEN_TITLE) {
      drawWorld(state);
      drawPanel(
        'HARBOR HEAT: PORTO AZUL',
        ['You owe $2,000 to Marlin. Explore, steal cars, and complete missions!', 'Controls: WASD/Arrows to Drive/Walk, E to Enter/Exit Car, F/Space to Punch.', 'Press ENTER or Space to Start New Game'],
        'PRESS ENTER TO START'
      );
    } else if (screen === SCREEN_PLAY) {
      drawWorld(state);
      drawHud(state);
      if (state.missionState === 'victory') {
        drawPanel(
          'VICTORY! DEBT PAID!',
          ['You delivered the final payment and settled your debt with Marlin!', `Final Money: $${state.player.money}`],
          'PRESS ENTER TO PLAY AGAIN'
        );
      }
    } else if (screen === SCREEN_PAUSED) {
      drawWorld(state);
      drawHud(state);
      drawPanel('GAME PAUSED', ['Press P or ESC to Resume'], 'PRESS P TO RESUME');
    } else if (screen === SCREEN_OVER) {
      drawPanel('WASTED / BUSTED', ['You were caught by police or lost all health.', `Remaining Money: $${state.player.money}`], 'PRESS ENTER TO TRY AGAIN');
    }
  }

  return { draw };
}
