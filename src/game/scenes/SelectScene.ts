import Phaser from 'phaser';
import { preloadCopperhead } from '../art/copperhead';
import { generateDeathRollTextures, preloadDeathRoll } from '../art/deathroll';
import { generateDisarrayTextures, preloadDisarray } from '../art/disarray';
import { generateEndGameTextures, preloadEndGame } from '../art/endgame';
import { generateGoldenFuryTextures, preloadGoldenFury } from '../art/goldenfury';
import { generateHugeTextures, preloadHuge } from '../art/huge';
import { generateHypershockTextures, preloadHypershock } from '../art/hypershock';
import { generateJackpotTextures, preloadJackpot } from '../art/jackpot';
import { generateMadCatterTextures, preloadMadCatter } from '../art/madcatter';
import { generateMagnitudeTextures, preloadMagnitude } from '../art/magnitude';
import { generateMaliceTextures, preloadMalice } from '../art/malice';
import { generateMantaTextures, preloadManta } from '../art/manta';
import { generateMinotaurTextures, preloadMinotaur } from '../art/minotaur';
import { generateOrbitronTextures, preloadOrbitron } from '../art/orbitron';
import { generateRibbotTextures, preloadRibbot } from '../art/ribbot';
import {
  DEPTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  HUD_FONT,
  TEXTURE_KEYS,
} from '../constants';
import {
  FIGHTERS,
  LOCKED_SLOTS,
  type FighterDef,
} from '../data/roster';
import type { BotProfile } from '../data/botProfile';
import type { LoadedFighter } from '../data/loadBotProfiles';
import {
  mergeProfileIntoFighter,
  REGISTRY_BOT_PROFILES,
  REGISTRY_OPPONENT_FIGHTER,
  REGISTRY_PLAYER_FIGHTER,
} from '../data/loadBotProfiles';

const SVG_ART_VERSION = 36;

type SelectStep = 'player' | 'opponent';

/**
 * Choose-your-fighter lobby — selectable roster from FIGHTERS.
 */
export class SelectScene extends Phaser.Scene {
  private selectable: FighterDef[] = [];
  private selectedIndex = 0;
  private step: SelectStep = 'player';
  private playerPickId: string | null = null;
  private profiles = new Map<string, BotProfile>();
  private confirmHint!: Phaser.GameObjects.Text;
  private featureRoot?: Phaser.GameObjects.Container;
  private thumbBorders: Phaser.GameObjects.Graphics[] = [];
  private pulse = 0;
  private inputBound = false;

  constructor() {
    super('SelectScene');
  }

  create(): void {
    this.profiles =
      (this.registry.get(REGISTRY_BOT_PROFILES) as Map<string, BotProfile>) ??
      new Map();
    this.step = 'player';
    this.playerPickId = null;
    this.refreshSelectable();

    const svgKeys = [
      TEXTURE_KEYS.deathrollPortrait,
      TEXTURE_KEYS.hudDeathroll,
      TEXTURE_KEYS.deathrollBody,
      TEXTURE_KEYS.copperheadPortrait,
      TEXTURE_KEYS.hudCopperhead,
      TEXTURE_KEYS.copperheadBody,
      TEXTURE_KEYS.disarrayPortrait,
      TEXTURE_KEYS.hudDisarray,
      TEXTURE_KEYS.disarrayBody,
      TEXTURE_KEYS.endgamePortrait,
      TEXTURE_KEYS.hudEndgame,
      TEXTURE_KEYS.endgameBody,
      TEXTURE_KEYS.goldenfuryPortrait,
      TEXTURE_KEYS.hudGoldenfury,
      TEXTURE_KEYS.goldenfuryBody,
      TEXTURE_KEYS.hugePortrait,
      TEXTURE_KEYS.hudHuge,
      TEXTURE_KEYS.hugeBody,
      TEXTURE_KEYS.hypershockPortrait,
      TEXTURE_KEYS.hudHypershock,
      TEXTURE_KEYS.hypershockBody,
      TEXTURE_KEYS.jackpotPortrait,
      TEXTURE_KEYS.hudJackpot,
      TEXTURE_KEYS.jackpotBody,
      TEXTURE_KEYS.madcatterPortrait,
      TEXTURE_KEYS.hudMadcatter,
      TEXTURE_KEYS.madcatterBody,
      TEXTURE_KEYS.magnitudePortrait,
      TEXTURE_KEYS.hudMagnitude,
      TEXTURE_KEYS.magnitudeBody,
      TEXTURE_KEYS.malicePortrait,
      TEXTURE_KEYS.hudMalice,
      TEXTURE_KEYS.maliceBody,
      TEXTURE_KEYS.mantaPortrait,
      TEXTURE_KEYS.hudManta,
      TEXTURE_KEYS.mantaBody,
      TEXTURE_KEYS.minotaurPortrait,
      TEXTURE_KEYS.hudMinotaur,
      TEXTURE_KEYS.minotaurBody,
      TEXTURE_KEYS.orbitronPortrait,
      TEXTURE_KEYS.hudOrbitron,
      TEXTURE_KEYS.orbitronBody,
      TEXTURE_KEYS.ribbotPortrait,
      TEXTURE_KEYS.hudRibbot,
      TEXTURE_KEYS.ribbotBody,
    ];
    const artVer = this.registry.get('svgArtV') as number | undefined;
    const needsReload =
      artVer !== SVG_ART_VERSION || svgKeys.some((k) => !this.textures.exists(k));

    if (needsReload) {
      for (const k of svgKeys) {
        if (this.textures.exists(k)) this.textures.remove(k);
      }
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
      this.load.once(Phaser.Loader.Events.COMPLETE, () => {
        generateDeathRollTextures(this);
        generateDisarrayTextures(this);
        generateEndGameTextures(this);
        generateGoldenFuryTextures(this);
        generateHugeTextures(this);
        generateHypershockTextures(this);
        generateJackpotTextures(this);
        generateMadCatterTextures(this);
        generateMagnitudeTextures(this);
        generateMaliceTextures(this);
        generateMantaTextures(this);
        generateMinotaurTextures(this);
        generateOrbitronTextures(this);
        generateRibbotTextures(this);
        this.registry.set('svgArtV', SVG_ART_VERSION);
        this.buildSelectUi();
      });
      this.load.start();
      return;
    }

    if (!this.textures.exists(TEXTURE_KEYS.deathrollWeapon)) {
      generateDeathRollTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.disarrayWeapon)) {
      generateDisarrayTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.endgameWeapon)) {
      generateEndGameTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.goldenfuryWeapon)) {
      generateGoldenFuryTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.hugeWeapon)) {
      generateHugeTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.hypershockWeapon)) {
      generateHypershockTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.jackpotWeapon)) {
      generateJackpotTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.madcatterWeapon)) {
      generateMadCatterTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.magnitudeWeapon)) {
      generateMagnitudeTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.maliceWeapon)) {
      generateMaliceTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.mantaWeapon)) {
      generateMantaTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.minotaurWeapon)) {
      generateMinotaurTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.orbitronWeapon)) {
      generateOrbitronTextures(this);
    }
    if (!this.textures.exists(TEXTURE_KEYS.ribbotWeapon)) {
      generateRibbotTextures(this);
    }

    this.buildSelectUi();
  }

  private buildSelectUi(): void {
    this.children.removeAll(true);
    this.featureRoot = undefined;
    this.thumbBorders = [];

    this.cameras.main.setBackgroundColor(0x06080c);
    this.drawBackdrop();
    this.drawHeader();
    this.rebuildFeatured();
    this.drawRosterRow();
    this.drawFooter();
    if (!this.inputBound) {
      this.setupInput();
      this.inputBound = true;
    }
  }

  update(_time: number, delta: number): void {
    this.pulse += delta;
    if (this.confirmHint) {
      const a = 0.55 + Math.sin(this.pulse / 280) * 0.35;
      this.confirmHint.setAlpha(a);
    }
  }

  private refreshSelectable(): void {
    const all = FIGHTERS.filter((f) => f.selectable);
    if (this.step === 'opponent' && this.playerPickId) {
      this.selectable = all.filter((f) => f.id !== this.playerPickId);
    } else {
      this.selectable = all;
    }
    if (this.selectedIndex >= this.selectable.length) {
      this.selectedIndex = 0;
    }
  }

  private get loadedSelected(): LoadedFighter {
    const f = this.selected;
    return mergeProfileIntoFighter(f, this.profiles.get(f.id));
  }

  private rosterGap(count: number): number {
    if (count >= 24) return 20;
    if (count >= 17) return 26;
    if (count >= 16) return 28;
    if (count >= 15) return 30;
    if (count >= 14) return 32;
    if (count >= 13) return 34;
    if (count >= 12) return 38;
    if (count >= 11) return 42;
    if (count >= 10) return 46;
    if (count >= 9) return 50;
    if (count >= 8) return 56;
    if (count >= 7) return 64;
    if (count >= 6) return 74;
    return count > 4 ? 86 : 100;
  }

  private get selected(): FighterDef {
    return this.selectable[this.selectedIndex]!;
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(DEPTH.studio);
    g.fillGradientStyle(0x0a0c12, 0x0a0c12, 0x0c1210, 0x0c1210, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const accent = this.selected.accent;
    g.fillStyle(accent, 0.07);
    g.fillCircle(GAME_WIDTH * 0.52, GAME_HEIGHT * 0.4, 180);
    g.fillStyle(accent, 0.04);
    g.fillCircle(GAME_WIDTH * 0.52, GAME_HEIGHT * 0.4, 260);

    g.fillStyle(0x10141c, 1);
    g.fillRect(0, GAME_HEIGHT - 56, GAME_WIDTH, 56);
    g.fillStyle(0xf7d038, 0.85);
    for (let x = 0; x < GAME_WIDTH; x += 28) {
      g.fillRect(x, GAME_HEIGHT - 56, 14, 6);
    }
    g.fillStyle(0x0a0c12, 1);
    for (let x = 14; x < GAME_WIDTH; x += 28) {
      g.fillRect(x, GAME_HEIGHT - 56, 14, 6);
    }

    g.lineStyle(1, 0xffffff, 0.03);
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      g.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  private drawHeader(): void {
    this.add
      .text(GAME_WIDTH / 2, 24, 'BATTLEBOTS', {
        fontFamily: HUD_FONT,
        fontSize: '26px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.hud);

    this.add
      .text(
        GAME_WIDTH / 2,
        52,
        this.step === 'player' ? 'CHOOSE YOUR FIGHTER' : 'CHOOSE OPPONENT',
        {
          fontFamily: HUD_FONT,
          fontSize: '13px',
          fontStyle: '700',
          color: '#8a93a5',
        },
      )
      .setOrigin(0.5)
      .setDepth(DEPTH.hud);

    if (this.step === 'opponent' && this.playerPickId) {
      const playerF = FIGHTERS.find((f) => f.id === this.playerPickId);
      this.add
        .text(
          GAME_WIDTH / 2,
          72,
          `YOU: ${playerF?.shortName ?? this.playerPickId.toUpperCase()}`,
          {
            fontFamily: HUD_FONT,
            fontSize: '10px',
            fontStyle: '700',
            color: playerF?.accentHex ?? '#27c5ff',
          },
        )
        .setOrigin(0.5)
        .setDepth(DEPTH.hud);
    }
  }

  private rebuildFeatured(): void {
    this.featureRoot?.destroy(true);
    const f = this.loadedSelected;
    const cardW = 400;
    const cardH = 268;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 - 28;

    const root = this.add.container(0, 0).setDepth(DEPTH.hud);
    this.featureRoot = root;

    const panel = this.add.graphics();
    panel.fillStyle(0x0e121a, 0.94);
    panel.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
    panel.lineStyle(2, f.accent, 1);
    panel.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10);
    panel.lineStyle(1, 0xffffff, 0.1);
    panel.strokeRoundedRect(
      cx - cardW / 2 + 4,
      cy - cardH / 2 + 4,
      cardW - 8,
      cardH - 8,
      8,
    );
    root.add(panel);

    // Soft accent halo behind every portrait so black parts don't vanish on dark UI.
    const halo = this.add.graphics();
    halo.fillStyle(f.accent, 0.18);
    halo.fillCircle(cx, cy - 40, 72);
    halo.fillStyle(f.accent, 0.08);
    halo.fillCircle(cx, cy - 40, 96);
    root.add(halo);

    const portrait = this.add.image(cx, cy - 36, f.portraitKey).setOrigin(0.5);
    const maxH = 150;
    const maxW = 280;
    const fit = Math.min(maxH / portrait.height, maxW / portrait.width, 1.15);
    portrait.setScale(fit);
    root.add(portrait);

    root.add(
      this.add
        .text(cx, cy + 68, f.name, {
          fontFamily: HUD_FONT,
          fontSize: '20px',
          fontStyle: '700',
          color: f.accentHex,
        })
        .setOrigin(0.5),
    );

    root.add(
      this.add
        .text(cx, cy + 90, f.weaponLabel, {
          fontFamily: HUD_FONT,
          fontSize: '10px',
          fontStyle: '700',
          color: '#8a93a5',
        })
        .setOrigin(0.5),
    );

    root.add(
      this.add
        .text(cx, cy + 108, f.strategyNotes, {
          fontFamily: HUD_FONT,
          fontSize: '9px',
          color: '#c8d0dc',
          align: 'center',
          wordWrap: { width: cardW - 48 },
        })
        .setOrigin(0.5),
    );

    const recordLine = f.record ? `RECORD ${f.record}` : '';
    const stratLine = `STRATEGY: ${f.strategy.replace(/_/g, ' ').toUpperCase()}`;
    root.add(
      this.add
        .text(cx, cy + 124, [recordLine, stratLine].filter(Boolean).join('  ·  '), {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          fontStyle: '700',
          color: '#8a93a5',
        })
        .setOrigin(0.5),
    );

    const statsY = cy + cardH / 2 - 18;
    [
      `DMG ${f.stats.attackDamage}`,
      `SPD ${f.stats.moveSpeed}`,
      `HP ${f.stats.maxHealth}`,
    ].forEach((label, i) => {
      root.add(
        this.add
          .text(cx - 90 + i * 90, statsY, label, {
            fontFamily: HUD_FONT,
            fontSize: '11px',
            fontStyle: '700',
            color: '#ffffff',
          })
          .setOrigin(0.5),
      );
    });

    // Nav chevrons
    root.add(
      this.add
        .text(cx - cardW / 2 - 28, cy, '‹', {
          fontFamily: HUD_FONT,
          fontSize: '36px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.shift(-1)),
    );
    root.add(
      this.add
        .text(cx + cardW / 2 + 28, cy, '›', {
          fontFamily: HUD_FONT,
          fontSize: '36px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.shift(1)),
    );

    const hit = this.add
      .rectangle(cx, cy, cardW, cardH, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.confirm());
    root.add(hit);

    this.refreshThumbBorders();
  }

  private drawRosterRow(): void {
    this.thumbBorders = [];
    const y = GAME_HEIGHT - 112;
    const items = [
      ...this.selectable.map((f) => ({ kind: 'fighter' as const, fighter: f })),
      ...LOCKED_SLOTS.map((s) => ({ kind: 'locked' as const, slot: s })),
    ];
    const gap = this.rosterGap(this.selectable.length);
    const startX = GAME_WIDTH / 2 - ((items.length - 1) * gap) / 2;

    items.forEach((item, i) => {
      const x = startX + i * gap;
      const border = this.add.graphics().setDepth(DEPTH.hud);
      this.thumbBorders.push(border);

      if (item.kind === 'fighter') {
        const f = item.fighter;
        border.fillStyle(0x0a0e16, 0.92);
        border.fillRoundedRect(x - 40, y - 30, 80, 60, 6);

        const thumbHalo = this.add.graphics().setDepth(DEPTH.hud);
        thumbHalo.fillStyle(f.accent, 0.22);
        thumbHalo.fillCircle(x, y - 6, 26);
        thumbHalo.fillStyle(f.accent, 0.1);
        thumbHalo.fillCircle(x, y - 6, 34);

        this.add
          .image(x, y - 4, f.hudKey)
          .setScale(1.35)
          .setDepth(DEPTH.hud);

        this.add
          .text(x, y + 20, f.shortName.slice(0, 9), {
            fontFamily: HUD_FONT,
            fontSize: '8px',
            fontStyle: '700',
            color: f.accentHex,
          })
          .setOrigin(0.5)
          .setDepth(DEPTH.hud);

        const hit = this.add
          .rectangle(x, y, 80, 60, 0x000000, 0.001)
          .setInteractive({ useHandCursor: true })
          .setDepth(DEPTH.hud + 1);
        hit.on('pointerdown', () => {
          this.selectedIndex = this.selectable.findIndex((x) => x.id === f.id);
          this.rebuildFeatured();
        });
      } else {
        border.fillStyle(0x0a0e16, 0.9);
        border.fillRoundedRect(x - 40, y - 30, 80, 60, 6);
        border.lineStyle(1, item.slot.accent, 0.3);
        border.strokeRoundedRect(x - 40, y - 30, 80, 60, 6);

        this.add
          .text(x, y - 6, '???', {
            fontFamily: HUD_FONT,
            fontSize: '14px',
            fontStyle: '700',
            color: '#4a5160',
          })
          .setOrigin(0.5)
          .setDepth(DEPTH.hud);

        this.add
          .text(x, y + 16, item.slot.label, {
            fontFamily: HUD_FONT,
            fontSize: '7px',
            color: '#5a6274',
          })
          .setOrigin(0.5)
          .setDepth(DEPTH.hud);
      }
    });

    this.refreshThumbBorders();
  }

  private refreshThumbBorders(): void {
    const y = GAME_HEIGHT - 112;
    const items = [
      ...this.selectable.map((f) => ({ kind: 'fighter' as const, fighter: f })),
      ...LOCKED_SLOTS.map((s) => ({ kind: 'locked' as const, slot: s })),
    ];
    const gap = this.rosterGap(this.selectable.length);
    const startX = GAME_WIDTH / 2 - ((items.length - 1) * gap) / 2;

    this.thumbBorders.forEach((border, i) => {
      const x = startX + i * gap;
      const item = items[i];
      if (!item || item.kind !== 'fighter') return;
      border.clear();
      border.fillStyle(0x0a0e16, 0.92);
      border.fillRoundedRect(x - 40, y - 30, 80, 60, 6);
      const selected = item.fighter.id === this.selected.id;
      border.lineStyle(2, selected ? item.fighter.accent : 0x2a3040, selected ? 1 : 0.5);
      border.strokeRoundedRect(x - 40, y - 30, 80, 60, 6);
    });
  }

  private drawFooter(): void {
    const hint =
      this.step === 'player'
        ? '← → SELECT   ·   ENTER — CHOOSE OPPONENT'
        : '← → SELECT   ·   ENTER — FIGHT   ·   BACKSPACE — BACK';
    this.confirmHint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 26, hint, {
        fontFamily: HUD_FONT,
        fontSize: '11px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.hud);
  }

  private setupInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.on('keydown-ENTER', () => this.confirm());
    keyboard.on('keydown-SPACE', () => this.confirm());
    keyboard.on('keydown-LEFT', () => this.shift(-1));
    keyboard.on('keydown-RIGHT', () => this.shift(1));
    keyboard.on('keydown-A', () => this.shift(-1));
    keyboard.on('keydown-D', () => this.shift(1));
    keyboard.on('keydown-BACKSPACE', () => this.goBack());
  }

  private shift(dir: number): void {
    if (this.selectable.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex + dir + this.selectable.length) %
      this.selectable.length;
    this.rebuildFeatured();
  }

  private goBack(): void {
    if (this.step !== 'opponent') return;
    this.step = 'player';
    this.playerPickId = null;
    this.refreshSelectable();
    this.buildSelectUi();
  }

  private confirm(): void {
    if (this.step === 'player') {
      this.playerPickId = this.selected.id;
      this.step = 'opponent';
      this.selectedIndex = 0;
      this.refreshSelectable();
      this.buildSelectUi();
      return;
    }

    this.registry.set(REGISTRY_PLAYER_FIGHTER, this.playerPickId);
    this.registry.set(REGISTRY_OPPONENT_FIGHTER, this.selected.id);
    this.scene.start('ArenaScene');
  }
}
