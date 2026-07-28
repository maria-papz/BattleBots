import Phaser from 'phaser';
import { AI } from '../constants';
import type { EnemyRobot } from '../entities/EnemyRobot';
import type { Robot } from '../entities/Robot';
import type { EnemyAIState, MatchState, MovementIntent } from '../types/game';
import { angleToDeg, distance } from '../utils/math';

export interface EnemyAIConfig {
  attackEnterFactor?: number;
  attackExitFactor?: number;
  repositionCooldownMs?: number;
  attackForwardCreep?: number;
  lowHpRetreatThreshold?: number;
}

export class EnemyAI {
  private state: EnemyAIState = 'CHASE';
  private stateEnteredAt = 0;
  private stuckMs = 0;
  private tooCloseMs = 0;
  private repositionDir = 1;
  private repositionDuration = AI.repositionDurationMs;
  private lastRepositionEnd = -Infinity;

  private readonly attackEnterFactor: number;
  private readonly attackExitFactor: number;
  private readonly repositionCooldownMs: number;
  private readonly attackForwardCreep: number;
  private readonly lowHpRetreatThreshold: number;

  constructor(config: EnemyAIConfig = {}) {
    this.attackEnterFactor = config.attackEnterFactor ?? AI.attackEnterFactor;
    this.attackExitFactor = config.attackExitFactor ?? AI.attackExitFactor;
    this.repositionCooldownMs =
      config.repositionCooldownMs ?? AI.repositionCooldownMs;
    this.attackForwardCreep =
      config.attackForwardCreep ?? AI.attackForwardCreep;
    this.lowHpRetreatThreshold = config.lowHpRetreatThreshold ?? 0.2;
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
    const desired = angleToDeg(enemy.x, enemy.y, player.x, player.y);
    const attackEnter = enemy.stats.attackRange * this.attackEnterFactor;
    const attackExit = enemy.stats.attackRange * this.attackExitFactor;
    const tooClose = enemy.stats.bodyRadius * AI.tooCloseFactor;
    const hpRatio = enemy.robotState.currentHealth / enemy.stats.maxHealth;

    this.updateStuck(enemy, deltaMs, dist, tooClose);

    const timeInState = now - this.stateEnteredAt;
    let intent: MovementIntent = { forward: 0, rotate: 0, attack: false };

    const forceRetreat = hpRatio < this.lowHpRetreatThreshold;

    switch (this.state) {
      case 'CHASE': {
        if (this.shouldReposition(now) || forceRetreat) {
          this.enter('REPOSITION', now, enemy);
          break;
        }
        if (dist <= attackEnter) {
          this.enter('ATTACK', now, enemy);
          break;
        }
        enemy.rotateToward(desired, deltaMs);
        intent = { forward: 1, rotate: 0, attack: false };
        break;
      }
      case 'ATTACK': {
        if (this.shouldReposition(now) || forceRetreat) {
          this.enter('REPOSITION', now, enemy);
          break;
        }
        if (dist > attackExit && timeInState > AI.minAttackStateMs) {
          this.enter('CHASE', now, enemy);
          break;
        }
        enemy.rotateToward(desired, deltaMs);
        const facingError = enemy.facingErrorTo(player.x, player.y);
        const creep =
          dist > enemy.stats.attackRange * 0.85 ? this.attackForwardCreep : 0;
        const canFire =
          enemy.robotState.canAttack &&
          facingError < AI.facingAttackDeg &&
          dist <= enemy.stats.attackRange;
        intent = { forward: creep, rotate: 0, attack: canFire };
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

  private shouldReposition(now: number): boolean {
    if (now - this.lastRepositionEnd < this.repositionCooldownMs) {
      return false;
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

  private enter(next: EnemyAIState, now: number, enemy: EnemyRobot): void {
    this.state = next;
    this.stateEnteredAt = now;
    this.stuckMs = 0;
    this.tooCloseMs = 0;

    if (next === 'REPOSITION') {
      this.repositionDir = Math.random() < 0.5 ? -1 : 1;
      const jitter = (Math.random() * 2 - 1) * AI.repositionJitterMs;
      this.repositionDuration = AI.repositionDurationMs + jitter;
      const nearLeft = enemy.x < 120;
      const nearRight = enemy.x > 840;
      if (nearLeft) this.repositionDir = 1;
      if (nearRight) this.repositionDir = -1;
    }
  }
}
