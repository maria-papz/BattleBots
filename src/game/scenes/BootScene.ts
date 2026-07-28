import Phaser from 'phaser';
import { generateGameTextures } from '../art/generateTextures';
import { preloadCopperhead } from '../art/copperhead';
import { preloadDeathRoll } from '../art/deathroll';
import { preloadDisarray } from '../art/disarray';
import { preloadEndGame } from '../art/endgame';
import { preloadGoldenFury } from '../art/goldenfury';
import { preloadHuge } from '../art/huge';
import { preloadHypershock } from '../art/hypershock';
import { preloadJackpot } from '../art/jackpot';
import { preloadMadCatter } from '../art/madcatter';
import { preloadMagnitude } from '../art/magnitude';
import { preloadMalice } from '../art/malice';
import { preloadManta } from '../art/manta';
import { preloadMinotaur } from '../art/minotaur';
import { preloadOrbitron } from '../art/orbitron';
import { preloadRibbot } from '../art/ribbot';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    preloadCopperhead(this);
    preloadDeathRoll(this);
    preloadDisarray(this);
    preloadEndGame(this);
    preloadGoldenFury(this);
    preloadHuge(this);
    preloadHypershock(this);
    preloadJackpot(this);
    preloadMadCatter(this);
    preloadMagnitude(this);
    preloadMalice(this);
    preloadManta(this);
    preloadMinotaur(this);
    preloadOrbitron(this);
    preloadRibbot(this);
  }

  create(): void {
    generateGameTextures(this);
    this.scene.start('SelectScene');
  }
}
