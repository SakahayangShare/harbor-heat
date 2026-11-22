// Game configuration, tuning constants, and color palette for Harbor Heat (Open-World Crime Driving Game).

export const WORLD = {
  width: 4000,
  height: 4000,
};

export const BLOCK_SIZE = 600; // Size of a city block
export const ROAD_WIDTH = 140; // Width of streets separating blocks

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

export const PLAYER_CAR = {
  width: 56,
  height: 30,
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
  bg: '#0f172a',         // Deep ocean/night base
  road: '#cbd5e1',       // Light gray asphalt roads
  roadLine: '#ffffff',   // White road lane lines
  sidewalk: '#f1f5f9',   // Light bright sidewalks
  building: [            // Vibrant colorful building palette for individual buildings
    '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#facc15', '#fb923c', '#60a5fa', '#a78bfa', '#f87171'
  ],
  player: '#ef4444',     // Bright red criminal car
  sports: '#10b981',     // Green sports car
  police: '#000000',     // Police car black-and-white base
  taxi: '#f59e0b',       // Yellow taxi
  pedestrian: '#0f172a', // High-contrast pedestrian dark silhouette
  cash: '#22c55e',       // Cash pickup green
  marker: '#facc15',     // Mission waypoint yellow
  text: '#ffffff',       // White text
  hudBg: 'rgba(15, 23, 42, 0.95)',
};

export const FONT = 'system-ui, -apple-system, sans-serif';
export const SAVE_KEY = 'harbor-heat.save.v1';
