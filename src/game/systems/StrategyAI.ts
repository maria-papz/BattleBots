import type { EnemyAIConfig } from './EnemyAI';
import type { StrategyStyle } from '../data/botProfile';

export function strategyToAiConfig(strategy: StrategyStyle): EnemyAIConfig {
  switch (strategy) {
    case 'aggressive_rusher':
      return {
        attackEnterFactor: 1.05,
        attackExitFactor: 1.05,
        repositionCooldownMs: 220,
        attackForwardCreep: 0.22,
        lowHpRetreatThreshold: 0.15,
      };
    case 'box_rush':
      return {
        attackEnterFactor: 1.1,
        attackExitFactor: 0.95,
        repositionCooldownMs: 280,
        attackForwardCreep: 0.28,
        lowHpRetreatThreshold: 0.2,
      };
    case 'counter_attacker':
      return {
        attackEnterFactor: 0.92,
        attackExitFactor: 1.2,
        repositionCooldownMs: 380,
        attackForwardCreep: 0.08,
        lowHpRetreatThreshold: 0.25,
      };
    case 'control_grinder':
      return {
        attackEnterFactor: 0.98,
        attackExitFactor: 1.1,
        repositionCooldownMs: 450,
        attackForwardCreep: 0.12,
        lowHpRetreatThreshold: 0.22,
      };
    case 'hit_and_run':
      return {
        attackEnterFactor: 1.0,
        attackExitFactor: 1.25,
        repositionCooldownMs: 200,
        attackForwardCreep: 0.15,
        lowHpRetreatThreshold: 0.3,
      };
    case 'defensive':
      return {
        attackEnterFactor: 0.88,
        attackExitFactor: 1.35,
        repositionCooldownMs: 500,
        attackForwardCreep: 0.05,
        lowHpRetreatThreshold: 0.4,
      };
    default:
      return {};
  }
}
