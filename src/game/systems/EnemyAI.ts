import Phaser from 'phaser';
import { AI } from '../constants';
import type { StrategyStyle } from '../data/botProfile';
import type { EnemyRobot } from '../entities/EnemyRobot';
import type { Robot } from '../entities/Robot';
import type { EnemyAIState, MatchState, MovementIntent } from '../types/game';
import { angleToDeg, distance } from '../utils/math';
import {
  getWallPushHeading,
  getWeaponFacingRequirement,
  isNearArenaWall,
  isPlayerOutOfPosition,
} from './WeaponBehavior';

export interface EnemyAIConfig {
  attackEnterFactor?: number;
  attackExitFactor?: number;
  repositionCooldownMs?: number;
  attackForwardCreep?: number;
  lowHpRetreatThreshold?: number;
}

interface StrategyBehavior {
  skipReposition?: boolean;
  stuckRepositionMs?: number;
  hitAndRun?: boolean;
  hitAndRunRepositionMs?: number;
}

export class EnemyAI {
  private state: EnemyAIState = 'CHASE';
  private stateEnteredAt = 0;
  private stuckMs = 0;
  private tooCloseMs = 0;
  private repositionDir = 1;
  private repositionDuration = AI.repositionDurationMs;
  private lastRepositionEnd = -Infinity;
  private forceRepositionAfterHit = false;

  private readonly strategy: StrategyStyle;
  private readonly attackEnterFactor: number;
  private readonly attackExitFactor: number;
  private readonly repositionCooldownMs: number;
  private readonly attackForwardCreep: number;
  private readonly lowHpRetreatThreshold: number;
  private readonly behavior: StrategyBehavior;

  constructor(strategy: StrategyStyle, config: EnemyAIConfig = {}) {
    this.strategy = strategy;
    this.attackEnterFactor = config.attackEnterFactor ?? AI.attackEnterFactor;
    this.attackExitFactor = config.attackExitFactor ?? AI.attackExitFactor;
    this.repositionCooldownMs =
      config.repositionCooldownMs ?? AI.repositionCooldownMs;
    this.attackForwardCreep =
      config.attackForwardCreep ?? AI.attackForwardCreep;
    this.lowHpRetreatThreshold = config.lowHpRetreatThreshold ?? 0.2;
    this.behavior = strategyBehavior(strategy);
  }

  notifyHitLanded(): void {
    if (this.behavior.hitAndRun) {
      this.forceRepositionAfterHit = true;
      this.repositionDuration =
        this.behavior.hitAndRunRepositionMs ?? AI.repositionDurationMs;
    }
  }

  update(
    enemy: EnemyRobot,
    player: Robot,
    deltaMs: number,
    matchState: MatchState,
    now: number,
  ): void {
    if (matchState !== 'PLAYING' || enemy.robotState.isDisabled) {
      enemy.setIntent({ forward: 0, rotate: 0, attack: false });
      return;
    }

    const dist = distance(enemy.x, enemy.y, player.x, player.y);
    const attackEnter = enemy.stats.attackRange * this.attackEnterFactor;
    const attackExit = enemy.stats.attackRange * this.attackExitFactor;
    const tooClose = enemy.stats.bodyRadius * AI.tooCloseFactor;
    const hpRatio = enemy.robotState.currentHealth / enemy.stats.maxHealth;

    this.updateStuck(enemy, deltaMs, dist, tooClose);

    const timeInState = now - this.stateEnteredAt;
    let intent: MovementIntent = { forward: 0, rotate: 0, attack: false };

    const forceRetreat = hpRatio < this.lowHpRetreatThreshold;

    if (this.forceRepositionAfterHit && this.state !== 'REPOSITION') {
      this.forceRepositionAfterHit = false;
      this.enter('REPOSITION', now, enemy);
    }

    switch (this.state) {
      case 'CHASE': {
        if (this.shouldReposition(now, forceRetreat)) {
          this.enter('REPOSITION', now, enemy);
          break;
        }
        if (dist <= attackEnter && this.shouldEngage(enemy, player, dist)) {
          this.enter('ATTACK', now, enemy);
          break;
        }
        intent = this.chaseIntent(enemy, player, deltaMs, dist);
        break;
      }
      case 'ATTACK': {
        if (this.shouldReposition(now, forceRetreat)) {
          this.enter('REPOSITION', now, enemy);
          break;
        }
        if (dist > attackExit && timeInState > AI.minAttackStateMs) {
          this.enter('CHASE', now, enemy);
          break;
        }
        enemy.rotateToward(
          angleToDeg(enemy.x, enemy.y, player.x, player.y),
          deltaMs,
        );
        const facingError = enemy.facingErrorTo(player.x, player.y);
        const creep =
          dist > enemy.stats.attackRange * 0.85 ? this.attackForwardCreep : 0;
        const canFire =
          enemy.robotState.canAttack &&
          facingError < getWeaponFacingRequirement(enemy.weaponClass) &&
          dist <= enemy.stats.attackRange &&
          this.shouldFire(enemy, player, facingError);
        intent = {
          forward: this.attackForward(creep),
          rotate: 0,
          attack: canFire,
        };
        break;
      }
      case 'REPOSITION': {
        if (timeInState < AI.repositionReverseMs) {
          intent = { forward: -1, rotate: 0, attack: false };
        } else {
          intent = { forward: 0, rotate: this.repositionDir, attack: false };
        }
        if (timeInState >= this.repositionDuration) {
          this.lastRepositionEnd = now;
          this.enter('CHASE', now, enemy);
        }
        break;
      }
    }

    enemy.setIntent(intent);
  }

  private chaseIntent(
    enemy: EnemyRobot,
    player: Robot,
    deltaMs: number,
    dist: number,
  ): MovementIntent {
    switch (this.strategy) {
      case 'counter_attacker':
        return this.counterChase(enemy, player, deltaMs);
      case 'control_grinder':
        return this.grinderChase(enemy, player, deltaMs);
      case 'defensive':
        return this.defensiveChase(enemy, player, deltaMs, dist);
      case 'box_rush':
      case 'aggressive_rusher':
        enemy.rotateToward(
          angleToDeg(enemy.x, enemy.y, player.x, player.y),
          deltaMs,
        );
        return { forward: 1, rotate: 0, attack: false };
      case 'hit_and_run':
      default:
        enemy.rotateToward(
          angleToDeg(enemy.x, enemy.y, player.x, player.y),
          deltaMs,
        );
        return { forward: 1, rotate: 0, attack: false };
    }
  }

  private counterChase(
    enemy: EnemyRobot,
    player: Robot,
    deltaMs: number,
  ): MovementIntent {
    const playerAttacking = player.intent.attack;
    const playerHp = player.robotState.currentHealth / player.stats.maxHealth;
    const enemyHp = enemy.robotState.currentHealth / enemy.stats.maxHealth;
    const outOfPosition = isPlayerOutOfPosition(player, enemy);

    if (playerAttacking || outOfPosition || playerHp < enemyHp) {
      enemy.rotateToward(
        angleToDeg(enemy.x, enemy.y, player.x, player.y),
        deltaMs,
      );
      return { forward: playerAttacking ? 0.6 : 1, rotate: 0, attack: false };
    }

    const strafeDir = enemy.x < player.x ? -1 : 1;
    enemy.rotateToward(
      angleToDeg(enemy.x, enemy.y, player.x, player.y),
      deltaMs,
    );
    return { forward: -0.15, rotate: strafeDir * 0.35, attack: false };
  }

  private grinderChase(
    enemy: EnemyRobot,
    player: Robot,
    deltaMs: number,
  ): MovementIntent {
    const desired = getWallPushHeading(enemy.x, enemy.y, player.x, player.y);
    enemy.rotateToward(desired, deltaMs);
    const forward = isNearArenaWall(player.x, player.y) ? 0.85 : 0.65;
    return { forward, rotate: 0, attack: false };
  }

  private defensiveChase(
    enemy: EnemyRobot,
    player: Robot,
    deltaMs: number,
    dist: number,
  ): MovementIntent {
    const playerHp = player.robotState.currentHealth / player.stats.maxHealth;
    const enemyHp = enemy.robotState.currentHealth / enemy.stats.maxHealth;
    const safeDist = enemy.stats.attackRange * 1.15;
    const hasAdvantage = enemyHp >= playerHp + 0.1;

    if (dist < safeDist * 0.65 && !hasAdvantage) {
      enemy.rotateToward(
        angleToDeg(enemy.x, enemy.y, player.x, player.y),
        deltaMs,
      );
      return { forward: -0.5, rotate: 0, attack: false };
    }

    if (hasAdvantage || dist > safeDist) {
      enemy.rotateToward(
        angleToDeg(enemy.x, enemy.y, player.x, player.y),
        deltaMs,
      );
      return { forward: hasAdvantage ? 0.7 : 0.35, rotate: 0, attack: false };
    }

    const strafeDir = enemy.y < player.y ? -1 : 1;
    enemy.rotateToward(
      angleToDeg(enemy.x, enemy.y, player.x, player.y),
      deltaMs,
    );
    return { forward: 0, rotate: strafeDir * 0.4, attack: false };
  }

  private shouldEngage(
    enemy: EnemyRobot,
    player: Robot,
    dist: number,
  ): boolean {
    switch (this.strategy) {
      case 'counter_attacker':
        return (
          player.intent.attack ||
          isPlayerOutOfPosition(player, enemy) ||
          dist < enemy.stats.attackRange * 0.75
        );
      case 'defensive': {
        const playerHp = player.robotState.currentHealth / player.stats.maxHealth;
        const enemyHp = enemy.robotState.currentHealth / enemy.stats.maxHealth;
        return enemyHp >= playerHp || dist < enemy.stats.attackRange * 0.6;
      }
      case 'control_grinder':
        return (
          isNearArenaWall(player.x, player.y) ||
          dist < enemy.stats.attackRange * 0.9
        );
      default:
        return true;
    }
  }

  private shouldFire(
    enemy: EnemyRobot,
    player: Robot,
    facingError: number,
  ): boolean {
    switch (this.strategy) {
      case 'counter_attacker':
        return (
          player.intent.attack ||
          player.facingErrorTo(enemy.x, enemy.y) > 70 ||
          facingError < 6
        );
      case 'control_grinder':
        return isNearArenaWall(player.x, player.y) || facingError < 10;
      case 'defensive': {
        const playerHp = player.robotState.currentHealth / player.stats.maxHealth;
        const enemyHp = enemy.robotState.currentHealth / enemy.stats.maxHealth;
        return enemyHp >= playerHp || player.intent.attack;
      }
      default:
        return true;
    }
  }

  private attackForward(creep: number): number {
    if (
      this.strategy === 'aggressive_rusher' ||
      this.strategy === 'box_rush'
    ) {
      return Math.max(creep, 0.25);
    }
    return creep;
  }

  private shouldReposition(now: number, forceRetreat: boolean): boolean {
    if (forceRetreat) {
      return true;
    }
    if (this.behavior.skipReposition) {
      const stuckThreshold = this.behavior.stuckRepositionMs ?? AI.stuckTimeMs;
      return this.stuckMs >= stuckThreshold;
    }
    if (now - this.lastRepositionEnd < this.repositionCooldownMs) {
      return false;
    }
    if (this.strategy === 'defensive') {
      return (
        this.tooCloseMs >= AI.tooCloseTimeMs * 0.5 ||
        this.stuckMs >= AI.stuckTimeMs
      );
    }
    return (
      this.stuckMs >= AI.stuckTimeMs || this.tooCloseMs >= AI.tooCloseTimeMs
    );
  }

  private updateStuck(
    enemy: EnemyRobot,
    deltaMs: number,
    dist: number,
    tooClose: number,
  ): void {
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const speed = body.velocity.length();

    if (enemy.intent.forward > 0 && speed < AI.stuckSpeedThreshold) {
      this.stuckMs += deltaMs;
    } else {
      this.stuckMs = 0;
    }

    if (dist < tooClose) {
      this.tooCloseMs += deltaMs;
    } else {
      this.tooCloseMs = 0;
    }
  }

  private enter(
    next: EnemyAIState,
    now: number,
    enemy?: EnemyRobot,
  ): void {
    this.state = next;
    this.stateEnteredAt = now;
    this.stuckMs = 0;
    this.tooCloseMs = 0;

    if (next === 'REPOSITION' && enemy) {
      this.repositionDir = Math.random() < 0.5 ? -1 : 1;
      const jitter = (Math.random() * 2 - 1) * AI.repositionJitterMs;
      this.repositionDuration = AI.repositionDurationMs + jitter;
      const nearLeft = enemy.x < 120;
      const nearRight = enemy.x > 840;
      if (nearLeft) this.repositionDir = 1;
      if (nearRight) this.repositionDir = -1;

      if (this.strategy === 'hit_and_run') {
        this.repositionDuration = 320 + jitter;
      }
    }
  }
}

function strategyBehavior(strategy: StrategyStyle): StrategyBehavior {
  switch (strategy) {
    case 'aggressive_rusher':
      return { skipReposition: true, stuckRepositionMs: 900 };
    case 'box_rush':
      return { skipReposition: true, stuckRepositionMs: 700 };
    case 'hit_and_run':
      return { hitAndRun: true, hitAndRunRepositionMs: 320 };
    default:
      return {};
  }
}
