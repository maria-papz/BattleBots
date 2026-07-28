import type { Robot } from '../entities/Robot';
import type { AttackResult, MatchState, WeaponEffect } from '../types/game';
import { computeWeaponStrikes } from './WeaponBehavior';

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
    if (attacker.isStunned(now)) {
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

    const strikes = computeWeaponStrikes(attacker, target);
    const landed = strikes.filter((strike) => strike.inArc);

    if (landed.length === 0) {
      return {
        hit: false,
        damage: 0,
        targetId: target.robotId,
        fired: true,
        blockedByCooldown: false,
      };
    }

    let totalDamage = 0;
    const effects: WeaponEffect[] = [];

    for (const strike of landed) {
      totalDamage += target.takeDamage(strike.damage);
      target.applyKnockback(attacker.facingDeg, strike.knockback, now);
      if (strike.launch) {
        target.applyStun(now);
        effects.push('launch');
      }
      if (strike.grind) {
        target.applyGrind(now);
        effects.push('grind');
      }
      if (strike.effect) {
        effects.push(strike.effect);
      }
    }

    return {
      hit: totalDamage > 0,
      damage: totalDamage,
      targetId: target.robotId,
      fired: true,
      blockedByCooldown: false,
      effects: effects.length > 0 ? [...new Set(effects)] : undefined,
    };
  }
}
