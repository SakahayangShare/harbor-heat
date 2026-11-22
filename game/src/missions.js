// Missions system for Harbor Heat: Porto Azul storyline & side activities.
// Logically pure, zero DOM access.

import { WORLD } from './config.js';

export const STORY_MISSIONS = [
  {
    id: 0,
    title: 'Welcome to Porto Azul',
    desc: 'Explore the city, collect cash or start taxi grinding.',
    targetX: WORLD.width / 2 + 300,
    targetY: WORLD.height / 2 + 300,
    reward: 200,
  },
  {
    id: 1,
    title: 'Taxi Fare',
    desc: 'Pick up passenger and drive them across town.',
    targetX: WORLD.width / 2 - 800,
    targetY: WORLD.height / 2 - 600,
    reward: 400,
  },
  {
    id: 2,
    title: 'Hot Wheels',
    desc: 'Steal the marked green sports car and deliver to the garage.',
    targetX: WORLD.width / 2 + 1000,
    targetY: WORLD.height / 2 - 800,
    reward: 800,
  },
  {
    id: 3,
    title: 'The Heat',
    desc: 'Survive with 3 wanted stars until police lose track of you.',
    targetX: WORLD.width / 2,
    targetY: WORLD.height / 2,
    reward: 1000,
  },
  {
    id: 4,
    title: 'The Drop',
    desc: 'Collect cash from 3 drop points while avoiding police.',
    targetX: WORLD.width / 2 - 1200,
    targetY: WORLD.height / 2 + 900,
    reward: 1200,
  },
  {
    id: 5,
    title: 'Debt Paid',
    desc: 'Deliver the final payment across the city to Marlin.',
    targetX: WORLD.width / 2 + 1200,
    targetY: WORLD.height / 2 + 1200,
    reward: 2000,
  },
];

export function createMissionManager() {
  let currentIndex = 0;
  let missionState = 'active';

  function getCurrentMission() {
    return STORY_MISSIONS[currentIndex] || STORY_MISSIONS[STORY_MISSIONS.length - 1];
  }

  function updateMission(player) {
    const mission = getCurrentMission();
    const dx = mission.targetX - player.x;
    const dy = mission.targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 70) {
      player.money += mission.reward;
      if (currentIndex < STORY_MISSIONS.length - 1) {
        currentIndex++;
      } else {
        missionState = 'victory';
      }
    }
    return distance;
  }

  return {
    getCurrentMission,
    updateMission,
    get missionState() { return missionState; },
  };
}
