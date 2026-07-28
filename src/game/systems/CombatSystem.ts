import type { Robot } from '../entities/Robot';
import type { AttackResult, MatchState } from '../types/game';
import { isWithinAttackArc } from '../utils/math';

export class CombatSystem {
  tryAttack(
    attacker: Robot,
    target: Robot,
    now: number,
    matchState: MatchState,
  ): AttackResult {
    const idle: AttackResult = {
      hit: false,
      damage: 0,
      targetId: target.robotId,
      fired: false,
      blockedByCooldown: false,
    };

    if (matchState !== 'PLAYING') {
      return idle;
    }
    if (attacker.robotState.isDisabled || target.robotState.isDisabled) {
      return idle;
    }
    if (!attacker.intent.attack) {
      return idle;
    }
    if (
      now - attacker.robotState.lastAttackTime <
      attacker.stats.attackCooldown
    ) {
      return {
        ...idle,
        blockedByCooldown: true,
      };
    }

    attacker.robotState.lastAttackTime = now;
    attacker.beginAttackVisual(now);

    const inArc = isWithinAttackArc(
      attacker.x,
      attacker.y,
      attacker.facingDeg,
      target.x,
      target.y,
      attacker.stats.attackRange,
      attacker.stats.attackArc,
    );

    if (!inArc) {
      return {
        hit: false,
        damage: 0,
        targetId: target.robotId,
        fired: true,
        blockedByCooldown: false,
      };
    }

    const applied = target.takeDamage(attacker.stats.attackDamage);
    target.applyKnockback(
      attacker.facingDeg,
      attacker.stats.knockbackForce,
      now,
    );

    return {
      hit: applied > 0,
      damage: applied,
      targetId: target.robotId,
      fired: true,
      blockedByCooldown: false,
    };
  }
}
