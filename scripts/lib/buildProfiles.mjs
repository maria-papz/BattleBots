import {
  STRATEGY_NOTES,
  strategyForWeapon,
  weaponLabelToClass,
} from './strategy.mjs';

/**
 * Build BotProfile objects for all Pro League bots.
 */
export function buildBotProfiles({ bots, rosterStats, standings, sources }) {
  return bots.map((bot) => {
    const stats = rosterStats[bot.id] ?? rosterStats.bloodsport;
    const standing = standings[bot.id] ?? { record: '0-0', winRate: 0.5 };
    const strategy = strategyForWeapon(bot.weaponType);
    const weaponClass = weaponLabelToClass(bot.weaponType);
    const winBonus =
      standing.winRate >= 1 ? 1.05 : standing.winRate <= 0 ? 0.95 : 1;

    return {
      id: bot.id,
      name: bot.name,
      weaponClass,
      weaponLabel: bot.weaponType.toUpperCase(),
      moveSpeed: Math.round(stats.moveSpeed * winBonus),
      reverseSpeed: stats.reverseSpeed,
      rotationSpeed: stats.rotationSpeed,
      attackDamage: Math.round(stats.attackDamage * winBonus),
      attackRange: stats.attackRange,
      attackArc: stats.attackArc,
      attackCooldown: stats.attackCooldown,
      knockbackForce: stats.knockbackForce,
      maxHealth: stats.maxHealth,
      bodyRadius: stats.bodyRadius,
      strategy,
      strategyNotes: STRATEGY_NOTES[strategy],
      winRate: standing.winRate,
      record: standing.record,
      sources,
    };
  });
}
