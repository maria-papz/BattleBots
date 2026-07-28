import Phaser from 'phaser';
import { ENEMY_STATS, TEXTURE_KEYS } from '../constants';
import type { MovementIntent } from '../types/game';
import { Robot } from './Robot';

export class EnemyRobot extends Robot {
  constructor(scene: Phaser.Scene, x: number, y: number, facingDeg: number) {
    super(
      scene,
      x,
      y,
      TEXTURE_KEYS.enemyBody,
      TEXTURE_KEYS.enemyWeapon,
      'enemy',
      ENEMY_STATS,
      facingDeg,
    );
  }

  setIntent(intent: MovementIntent): void {
    this.intent = intent;
  }
}
