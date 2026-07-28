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
import { preloadSkorpios } from '../art/skorpios';
import { preloadSwitchback } from '../art/switchback';
import { preloadTerrortops } from '../art/terrortops';
import { preloadTheTwins } from '../art/thetwins';
import { preloadTombstone } from '../art/tombstone';
import { preloadValkyrie } from '../art/valkyrie';
import { preloadWitchDoctor } from '../art/witchdoctor';
import { preloadBanshee } from '../art/banshee';
import { preloadCalypso } from '../art/calypso';
import { preloadNemesis } from '../art/nemesis';
import {
  loadBotProfiles,
  REGISTRY_BOT_PROFILES,
} from '../data/loadBotProfiles';

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
    preloadSkorpios(this);
    preloadSwitchback(this);
    preloadTerrortops(this);
    preloadTheTwins(this);
    preloadTombstone(this);
    preloadValkyrie(this);
    preloadWitchDoctor(this);
    preloadBanshee(this);
    preloadCalypso(this);
    preloadNemesis(this);
  }

  create(): void {
    generateGameTextures(this);

    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Loading league data…', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
        color: '#8a93a5',
      })
      .setOrigin(0.5);

    void loadBotProfiles()
      .then((profiles) => {
        this.registry.set(REGISTRY_BOT_PROFILES, profiles);
        this.scene.start('SelectScene');
      })
      .catch(() => {
        this.registry.set(REGISTRY_BOT_PROFILES, new Map());
        this.scene.start('SelectScene');
      });
  }
}
