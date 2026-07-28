import Phaser from 'phaser';
import type { LoadedFighter } from '../data/loadBotProfiles';
import type { MovementIntent } from '../types/game';
import { Robot } from './Robot';

export class EnemyRobot extends Robot {
  readonly fighter: LoadedFighter;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    facingDeg: number,
    fighter: LoadedFighter,
  ) {
    super(
      scene,
      x,
      y,
      fighter.bodyKey,
      fighter.weaponKey,
      'enemy',
      fighter.stats,
      facingDeg,
      fighter.weaponClass,
    );
    this.fighter = fighter;
  }

  setIntent(intent: MovementIntent): void {
    this.intent = intent;
  }
}
