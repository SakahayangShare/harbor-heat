// Keyboard and pointer input module for Harbor Heat.
// Handles steering, throttle, braking, enter/exit vehicle (E), attack/punch (F), pause (P), and confirm.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const BRAKE = new Set(['Space', 'ShiftLeft', 'ShiftRight']);
const INTERACT = new Set(['KeyE']);
const ATTACK = new Set(['KeyF', 'KeyQ']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);

export function createInput(target) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let brake = false;
  let interact = false;
  let attack = false;
  let actions = 0;

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (BRAKE.has(event.code)) brake = true;
    else if (INTERACT.has(event.code)) {
      if (!event.repeat) interact = true;
    } else if (ATTACK.has(event.code)) {
      if (!event.repeat) attack = true;
    } else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else return;
    event.preventDefault();
  });

  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
    else if (BRAKE.has(event.code)) brake = false;
    else if (INTERACT.has(event.code)) interact = false;
    else if (ATTACK.has(event.code)) attack = false;
  });

  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
    brake = false;
    interact = false;
    attack = false;
  });

  target.addEventListener('pointerdown', () => {
    actions |= ACTION_CONFIRM;
  });

  return {
    getControls() {
      const controls = {
        steer: (right ? 1 : 0) - (left ? 1 : 0),
        throttle: (up ? 1 : 0) - (down ? 1 : 0),
        brake,
        interact,
        attack,
      };
      // Reset one-shot triggers
      interact = false;
      attack = false;
      return controls;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
