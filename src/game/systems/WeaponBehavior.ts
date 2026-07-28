import type { WeaponClass } from '../data/botProfile';
import type { Robot } from '../entities/Robot';
import type { WeaponEffect } from '../types/game';
import { ARENA_MARGIN, GAME_HEIGHT, GAME_WIDTH } from '../constants';
import {
  angleToDeg,
  distance,
  isWithinAttackArc,
  shortestAngleDiffDeg,
} from '../utils/math';

export interface WeaponStrike {
  inArc: boolean;
  damage: number;
  knockback: number;
  launch?: boolean;
  grind?: boolean;
  effect?: WeaponEffect;
}

const WALL_GRIND_MARGIN = 52;

export function isNearArenaWall(x: number, y: number): boolean {
  const minX = ARENA_MARGIN + WALL_GRIND_MARGIN;
  const maxX = GAME_WIDTH - ARENA_MARGIN - WALL_GRIND_MARGIN;
  const minY = ARENA_MARGIN + WALL_GRIND_MARGIN;
  const maxY = GAME_HEIGHT - ARENA_MARGIN - WALL_GRIND_MARGIN;
  return x <= minX || x >= maxX || y <= minY || y >= maxY;
}

function isRearOrSideHit(attacker: Robot, target: Robot): boolean {
  const bearingFromTarget = angleToDeg(target.x, target.y, attacker.x, attacker.y);
  const facingError = Math.abs(
    shortestAngleDiffDeg(target.facingDeg, bearingFromTarget),
  );
  return facingError > 55;
}

function inWeaponArc(
  attacker: Robot,
  target: Robot,
  facingDeg: number,
  arcMultiplier = 1,
): boolean {
  const weaponClass = attacker.weaponClass;
  const arc =
    weaponClass === 'horizontal_spinner'
      ? 360
      : attacker.stats.attackArc * arcMultiplier;

  return isWithinAttackArc(
    attacker.x,
    attacker.y,
    facingDeg,
    target.x,
    target.y,
    attacker.stats.attackRange,
    arc,
  );
}

function baseStrike(
  attacker: Robot,
  target: Robot,
  facingDeg: number,
  arcMultiplier = 1,
): WeaponStrike {
  const inArc = inWeaponArc(attacker, target, facingDeg, arcMultiplier);
  return {
    inArc,
    damage: attacker.stats.attackDamage,
    knockback: attacker.stats.knockbackForce,
  };
}

function applyWeaponModifiers(
  attacker: Robot,
  target: Robot,
  strike: WeaponStrike,
): WeaponStrike {
  const weaponClass = attacker.weaponClass;
  let { damage, knockback } = strike;
  let launch = false;
  let grind = false;
  let effect: WeaponEffect | undefined;

  switch (weaponClass) {
    case 'horizontal_spinner':
      damage = Math.round(damage * 0.88);
      knockback = Math.round(knockback * 1.1);
      break;
    case 'vertical_spinner': {
      const bearing = angleToDeg(attacker.x, attacker.y, target.x, target.y);
      const facingError = Math.abs(
        shortestAngleDiffDeg(attacker.facingDeg, bearing),
      );
      if (facingError < 8) {
        damage = Math.round(damage * 1.3);
        effect = 'precision';
      }
      break;
    }
    case 'undercutter':
      if (isRearOrSideHit(attacker, target)) {
        damage = Math.round(damage * 1.45);
        effect = 'undercut';
      }
      break;
    case 'drum':
      damage = Math.round(damage * 1.35);
      knockback = Math.round(knockback * 1.25);
      break;
    case 'flipper':
      knockback = Math.round(knockback * 2.4);
      launch = true;
      break;
    case 'saw':
      if (isNearArenaWall(target.x, target.y)) {
        damage = Math.round(damage * 2);
        grind = true;
        effect = 'grind';
      } else {
        damage = Math.round(damage * 0.85);
      }
      break;
    case 'multibot':
      damage = Math.round(damage * 0.72);
      break;
    case 'dual_spinner':
      damage = Math.round(damage * 0.68);
      effect = 'double_hit';
      break;
    default:
      break;
  }

  return {
    ...strike,
    damage,
    knockback,
    launch,
    grind,
    effect: effect ?? strike.effect,
  };
}

/** Compute one or more weapon strikes for this attack swing. */
export function computeWeaponStrikes(attacker: Robot, target: Robot): WeaponStrike[] {
  const weaponClass = attacker.weaponClass;
  const facing = attacker.facingDeg;

  if (weaponClass === 'multibot') {
    const offsets = [-28, 28];
    return offsets.map((offset) => {
      const strike = baseStrike(attacker, target, facing + offset);
      return strike.inArc
        ? applyWeaponModifiers(attacker, target, strike)
        : strike;
    });
  }

  if (weaponClass === 'dual_spinner') {
    const strike = applyWeaponModifiers(
      attacker,
      target,
      baseStrike(attacker, target, facing, 1.35),
    );
    if (!strike.inArc) {
      return [strike];
    }
    return [
      { ...strike, effect: 'double_hit' },
      { ...strike, effect: 'double_hit' },
    ];
  }

  const strike = baseStrike(attacker, target, facing);
  if (!strike.inArc) {
    return [strike];
  }
  return [applyWeaponModifiers(attacker, target, strike)];
}

export function getWeaponFacingRequirement(weaponClass: WeaponClass): number {
  switch (weaponClass) {
    case 'horizontal_spinner':
      return 45;
    case 'flipper':
      return 10;
    case 'vertical_spinner':
      return 8;
    default:
      return 12;
  }
}

export function getWallPushHeading(
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
): number {
  const toTarget = angleToDeg(fromX, fromY, targetX, targetY);

  const distLeft = targetX - ARENA_MARGIN;
  const distRight = GAME_WIDTH - ARENA_MARGIN - targetX;
  const distTop = targetY - ARENA_MARGIN;
  const distBottom = GAME_HEIGHT - ARENA_MARGIN - targetY;
  const min = Math.min(distLeft, distRight, distTop, distBottom);

  let wallX = targetX;
  let wallY = targetY;
  if (min === distLeft) wallX = ARENA_MARGIN;
  else if (min === distRight) wallX = GAME_WIDTH - ARENA_MARGIN;
  else if (min === distTop) wallY = ARENA_MARGIN;
  else wallY = GAME_HEIGHT - ARENA_MARGIN;

  const towardWall = angleToDeg(targetX, targetY, wallX, wallY);
  const bias = 0.45;
  const diff = shortestAngleDiffDeg(toTarget, towardWall);
  return toTarget + diff * bias;
}

export function isPlayerOutOfPosition(player: Robot, enemy: Robot): boolean {
  const centerX = GAME_WIDTH / 2;
  const centerY = GAME_HEIGHT / 2;
  const playerCenterDist = distance(player.x, player.y, centerX, centerY);
  const enemyCenterDist = distance(enemy.x, enemy.y, centerX, centerY);
  return playerCenterDist > enemyCenterDist + 40;
}
