import Phaser from 'phaser';
import type { FighterDef } from '../data/roster';
import type { MatchState } from '../types/game';
import { Robot } from './Robot';

interface PlayerKeys {
  W: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
}

export class PlayerRobot extends Robot {
  private readonly keys: PlayerKeys;
  readonly fighter: FighterDef;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    facingDeg: number,
    fighter: FighterDef,
  ) {
    super(
      scene,
      x,
      y,
      fighter.bodyKey,
      fighter.weaponKey,
      'player',
      fighter.stats,
      facingDeg,
    );
    this.fighter = fighter;

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard plugin unavailable');
    }

    this.keys = keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as PlayerKeys;
  }

  readInput(matchState: MatchState): void {
    if (matchState !== 'PLAYING' || this.robotState.isDisabled) {
      this.intent = { forward: 0, rotate: 0, attack: false };
      return;
    }

    let forward = 0;
    if (this.keys.W.isDown) forward += 1;
    if (this.keys.S.isDown) forward -= 1;

    let rotate = 0;
    if (this.keys.A.isDown) rotate -= 1;
    if (this.keys.D.isDown) rotate += 1;

    const attack = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);

    this.intent = { forward, rotate, attack };
  }
}
