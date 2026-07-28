export interface RobotStats {
  maxHealth: number;
  moveSpeed: number;
  reverseSpeed: number;
  rotationSpeed: number;
  attackDamage: number;
  attackRange: number;
  attackArc: number;
  attackCooldown: number;
  knockbackForce: number;
  bodyRadius: number;
}

export interface RobotState {
  currentHealth: number;
  canAttack: boolean;
  isAttacking: boolean;
  isDisabled: boolean;
  lastAttackTime: number;
}

export type MatchState =
  | 'READY'
  | 'PLAYING'
  | 'PLAYER_WON'
  | 'PLAYER_LOST'
  | 'PAUSED';

export type EnemyAIState = 'CHASE' | 'ATTACK' | 'REPOSITION';

export type RobotId = 'player' | 'enemy';

export interface AttackResult {
  hit: boolean;
  damage: number;
  targetId: RobotId;
  fired: boolean;
  /** True when Space/AI tried to attack but cooldown was not ready. */
  blockedByCooldown: boolean;
}

export interface MovementIntent {
  forward: number;
  rotate: number;
  attack: boolean;
}
