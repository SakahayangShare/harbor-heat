// Canvas 2D rendering engine for Harbor Heat (Porto Azul).
// Camera following player, city layout, entities, HUD, minimap, and game screens.
// Logically pure canvas 2D API calls, zero external images.

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.width = canvas.width;
    view.height = canvas.height;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawWorld(state) {
    ctx.save();
    // Camera transform centered on player
    const player = state.player;
    const cx = view.width / 2 - player.x;
    const cy = view.height / 2 - player.y;

    ctx.translate(cx, cy);

    // Background & Ocean in South
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Ocean & Beach in south
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, WORLD.height - 800, WORLD.width, 800);
    ctx.fillStyle = '#fde047'; // Sand
    ctx.fillRect(0, WORLD.height - 900, WORLD.width, 100);

    // Roads
    ctx.fillStyle = PALETTE.road;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    // Buildings
    for (const b of state.buildings) {
      ctx.fillStyle = PALETTE.building[b.colorIndex % PALETTE.building.length];
      ctx.fillRect(b.x, b.y, b.width, b.height);
      // Roof detail
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(b.x + 15, b.y + 15, b.width - 30, b.height - 30);
    }

    // Cash Pickups
    for (const cash of state.cashPickups) {
      ctx.fillStyle = PALETTE.cash;
      ctx.beginPath();
      ctx.arc(cash.x, cash.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parked Cars
    for (const car of state.parkedCars) {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = car.model.color;
      ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
      ctx.restore();
    }

    // Traffic Cars
    for (const car of state.traffic) {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
      ctx.restore();
    }

    // Police
    for (const p of state.police) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = PALETTE.police;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }

    // Pedestrians
    for (const ped of state.pedestrians) {
      ctx.fillStyle = ped.knockedOut ? '#94a3b8' : PALETTE.pedestrian;
      ctx.beginPath();
      ctx.arc(ped.x, ped.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    if (player.inVehicle) {
      ctx.fillStyle = player.vehicleModel.color;
      ctx.fillRect(-26, -14, 52, 28);
    } else {
      ctx.fillStyle = PALETTE.player;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Mission marker waypoint (Yellow)
    const mission = state.currentMission;
    if (mission) {
      ctx.fillStyle = PALETTE.marker;
      ctx.beginPath();
      ctx.arc(mission.targetX, mission.targetY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `bold 14px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', mission.targetX, mission.targetY);
    }

    ctx.restore();
  }

  function drawHud(state) {
    const player = state.player;
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(20, 20, 360, 130);

    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 18px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(`Money: $${player.money}`, 35, 35);
    ctx.fillText(`Health: ${Math.max(0, Math.round(player.health))}%`, 35, 65);
    ctx.fillText(`Wanted: ${'★'.repeat(player.wanted)}${'☆'.repeat(3 - player.wanted)}`, 35, 95);

    // Objective & Distance
    const mission = state.currentMission;
    if (mission) {
      const dist = Math.round(player.missionDistance || 0);
      ctx.fillStyle = PALETTE.marker;
      ctx.fillText(`Objective: ${mission.title} (${dist}m)`, 35, 120);
    }

    // Speedometer
    const speedKmh = Math.round(Math.abs(player.speed) * 0.8);
    ctx.fillStyle = PALETTE.text;
    ctx.textAlign = 'right';
    ctx.fillText(`${speedKmh} km/h`, view.width - 35, 35);

    // Minimap
    drawMinimap(state);
  }

  function drawMinimap(state) {
    const mapSize = 160;
    const mapX = view.width - mapSize - 20;
    const mapY = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapSize, mapSize);

    const scale = mapSize / WORLD.width;
    const player = state.player;

    // Draw buildings on minimap
    ctx.fillStyle = '#334155';
    for (const b of state.buildings) {
      ctx.fillRect(mapX + b.x * scale, mapY + b.y * scale, b.width * scale, b.height * scale);
    }

    // Draw player on minimap
    ctx.fillStyle = PALETTE.player;
    ctx.beginPath();
    ctx.arc(mapX + player.x * scale, mapY + player.y * scale, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw mission marker on minimap
    const mission = state.currentMission;
    if (mission) {
      ctx.fillStyle = PALETTE.marker;
      ctx.beginPath();
      ctx.arc(mapX + mission.targetX * scale, mapY + mission.targetY * scale, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPanel(title, lines, prompt) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    const pw = 600;
    const ph = 260 + lines.length * 30;
    const px = (view.width - pw) / 2;
    const py = (view.height - ph) / 2;

    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 28px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, view.width / 2, py + 30);

    ctx.font = `18px ${FONT}`;
    let ly = py + 80;
    for (const line of lines) {
      ctx.fillText(line, view.width / 2, ly);
      ly += 30;
    }

    ctx.fillStyle = PALETTE.marker;
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText(prompt, view.width / 2, py + ph - 45);
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
