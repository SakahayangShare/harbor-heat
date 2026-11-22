// Game configuration, tuning constants, and color palette for Harbor Heat (Open-World Crime Driving Game).

export const WORLD = {
  width: 4000,
  height: 4000,
};

export const BLOCK_SIZE = 600; // Size of a city block
export const ROAD_WIDTH = 120; // Width of streets separating blocks

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

export const PLAYER_CAR = {
  width: 52,
  height: 28,
  maxSpeed: 480,
  reverseSpeed: 160,
  accel: 320,
  brake: 700,
  friction: 220,
  turnSpeed: 3.5,
};

export const MAX_HEALTH = 100;
export const MAX_WANTED = 3;

export const PALETTE = {
  bg: '#11151c',
  road: '#212631',
  roadLine: '#3e4859',
  sidewalk: '#2d3340',
  building: ['#4b5563', '#374151', '#1f2937', '#6b7280', '#475569', '#334155'],
  player: '#ef4444',     // Red criminal car
  sports: '#10b981',     // Green sports car (Hot Wheels)
  police: '#3b82f6',     // Blue/Red police car
  taxi: '#f59e0b',       // Yellow taxi
  pedestrian: '#cbd5e1',
  cash: '#22c55e',       // Cash pickup
  marker: '#fbbf24',     // Mission waypoint yellow
  text: '#f1f5f9',
  hudBg: 'rgba(15, 23, 42, 0.85)',
};

export const FONT = 'system-ui, -apple-system, sans-serif';
export const SAVE_KEY = 'harbor-heat.save.v1';
