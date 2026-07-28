export const STRATEGY_BY_WEAPON = {
  flipper: 'box_rush',
  drum: 'aggressive_rusher',
  horizontal: 'aggressive_rusher',
  undercutter: 'hit_and_run',
  saw: 'control_grinder',
  multibot: 'hit_and_run',
  dual: 'counter_attacker',
  vertical: 'counter_attacker',
};

export const STRATEGY_NOTES = {
  aggressive_rusher: 'Commits early, chases down opponents with sustained weapon pressure.',
  box_rush: 'Fast box-rush into flip attacks; punishes slow spin-up bots.',
  counter_attacker: 'Waits for openings, punishes mispositioned opponents.',
  control_grinder: 'Grinds opponents against walls with saw or control weapon.',
  hit_and_run: 'Strikes quickly then repositions before counter-attack.',
  defensive: 'Plays cagey, survives to judges decision when behind.',
};

export function weaponLabelToClass(weaponType) {
  const lower = weaponType.toLowerCase();
  if (lower.includes('flipper')) return 'flipper';
  if (lower.includes('undercut')) return 'undercutter';
  if (lower.includes('saw') || lower.includes('overhead')) return 'saw';
  if (lower.includes('multibot') || lower.includes('cluster')) return 'multibot';
  if (lower.includes('dual') || lower.includes('twin')) return 'dual_spinner';
  if (lower.includes('drum')) return 'drum';
  if (lower.includes('horizontal') || lower.includes('bar') || lower.includes('ring')) {
    return 'horizontal_spinner';
  }
  return 'vertical_spinner';
}

export function strategyForWeapon(weaponType) {
  const lower = weaponType.toLowerCase();
  if (lower.includes('flipper')) return STRATEGY_BY_WEAPON.flipper;
  if (lower.includes('drum')) return STRATEGY_BY_WEAPON.drum;
  if (lower.includes('undercut')) return STRATEGY_BY_WEAPON.undercutter;
  if (lower.includes('saw')) return STRATEGY_BY_WEAPON.saw;
  if (lower.includes('multibot') || lower.includes('cluster')) return STRATEGY_BY_WEAPON.multibot;
  if (lower.includes('dual') || lower.includes('twin')) return STRATEGY_BY_WEAPON.dual;
  if (lower.includes('horizontal') || lower.includes('bar') || lower.includes('ring')) {
    return STRATEGY_BY_WEAPON.horizontal;
  }
  return STRATEGY_BY_WEAPON.vertical;
}

export function recordToWinRate(record) {
  const m = record.match(/(\d+)-(\d+)/);
  if (!m) return 0.5;
  const wins = Number(m[1]);
  const losses = Number(m[2]);
  const total = wins + losses;
  if (total === 0) return 0.5;
  return wins / total;
}
