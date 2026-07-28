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
import {
  getProLeagueBot,
} from '../data/proLeague';
import type { BotProfile } from '../data/botProfile';
import type { LoadedFighter } from '../data/loadBotProfiles';
import {
  mergeProfileIntoFighter,
  REGISTRY_BOT_PROFILES,
  REGISTRY_OPPONENT_FIGHTER,
  REGISTRY_PLAYER_FIGHTER,
} from '../data/loadBotProfiles';
import { sfx } from '../audio/Sfx';
const SVG_ART_VERSION = 36;

type SelectStep = 'player' | 'opponent';

/** Fixed layout zones — keeps portrait, stats table, and roster from overlapping. */
const LAYOUT = {
  thumbW: 56,
  thumbH: 42,
  contentTop: 84,
  contentBottom: 352,
  rosterRow1Y: 388,
  rosterRow2Y: 438,
  footerY: 512,
  leftX: 20,
  leftW: 272,
  rightX: 308,
  rightW: 632,
  portraitX: 156,
  portraitY: 198,
} as const;

interface StatRow {
  label: string;
  value: string;
  valueColor?: string;
}

interface ParsedRecord {
  wins: number;
  losses: number;
  winRate: number;
  form: 'winning' | 'losing' | 'even' | 'unknown';
}

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
  private inputHandlers?: {
    confirm: () => void;
    shiftLeft: () => void;
    shiftRight: () => void;
    goBack: () => void;
  };

  constructor() {
    super('SelectScene');
  }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.teardownInput());

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
    this.setupInput();
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

  private rosterGap(count: number, thumbW: number): number {
    if (count <= 1) return thumbW;
    const maxSpan = GAME_WIDTH - 48;
    const fitGap = maxSpan / (count - 1);
    return Math.max(thumbW + 4, Math.min(thumbW + 10, fitGap));
  }

  private rosterRows(): Array<{
    y: number;
    gap: number;
    items: Array<
      | { kind: 'fighter'; fighter: FighterDef }
      | { kind: 'locked'; slot: (typeof LOCKED_SLOTS)[number] }
    >;
  }> {
    const items = [
      ...this.selectable.map((f) => ({ kind: 'fighter' as const, fighter: f })),
      ...LOCKED_SLOTS.map((s) => ({ kind: 'locked' as const, slot: s })),
    ];
    const thumbW = LAYOUT.thumbW;
    const useTwoRows = items.length > 14;
    if (!useTwoRows) {
      return [
        {
          y: LAYOUT.rosterRow1Y,
          gap: this.rosterGap(items.length, thumbW),
          items,
        },
      ];
    }

    const split = Math.ceil(items.length / 2);
    const row1 = items.slice(0, split);
    const row2 = items.slice(split);
    return [
      { y: LAYOUT.rosterRow1Y, gap: this.rosterGap(row1.length, thumbW), items: row1 },
      { y: LAYOUT.rosterRow2Y, gap: this.rosterGap(row2.length, thumbW), items: row2 },
    ];
  }

  private formatStrategy(strategy: string): string {
    return strategy.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private formatWeaponClass(weaponClass: string): string {
    return weaponClass.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private parseRecord(f: LoadedFighter): ParsedRecord {
    if (!f.record) {
      return { wins: 0, losses: 0, winRate: 0.5, form: 'unknown' };
    }
    const m = f.record.match(/(\d+)-(\d+)/);
    if (!m) {
      return { wins: 0, losses: 0, winRate: 0.5, form: 'unknown' };
    }
    const wins = Number(m[1]);
    const losses = Number(m[2]);
    const total = wins + losses;
    const winRate = total > 0 ? wins / total : f.winRate ?? 0.5;
    const form =
      wins > losses ? 'winning' : losses > wins ? 'losing' : total > 0 ? 'even' : 'unknown';
    return { wins, losses, winRate, form };
  }

  private recordFormLabel(parsed: ParsedRecord): string {
    switch (parsed.form) {
      case 'winning':
        return parsed.losses === 0 ? 'UNDEFEATED' : 'WINNING FORM';
      case 'losing':
        return parsed.wins === 0 ? 'WINLESS' : 'LOSING FORM';
      case 'even':
        return 'EVEN RECORD';
      default:
        return 'NO LEAGUE DATA';
    }
  }

  private recordValueColor(parsed: ParsedRecord): string {
    switch (parsed.form) {
      case 'winning':
        return '#4ade80';
      case 'losing':
        return '#f87171';
      case 'even':
        return '#facc15';
      default:
        return '#8a93a5';
    }
  }

  private leagueStatModifier(parsed: ParsedRecord): string {
    if (parsed.form === 'unknown') return '—';
    if (parsed.winRate >= 1) return '+5% dmg & speed';
    if (parsed.winRate <= 0) return '−5% dmg & speed';
    return 'Neutral';
  }

  private combatStatRows(f: LoadedFighter): StatRow[] {
    const s = f.stats;
    return [
      { label: 'Health', value: String(s.maxHealth) },
      { label: 'Damage', value: String(s.attackDamage) },
      { label: 'Move Speed', value: String(s.moveSpeed) },
      { label: 'Reverse Speed', value: String(s.reverseSpeed) },
      { label: 'Turn Speed', value: String(s.rotationSpeed) },
      { label: 'Attack Range', value: String(s.attackRange) },
      { label: 'Attack Arc', value: `${s.attackArc}°` },
      { label: 'Cooldown', value: `${s.attackCooldown}ms` },
      { label: 'Knockback', value: String(s.knockbackForce) },
      { label: 'Body Size', value: String(s.bodyRadius) },
      { label: 'Weapon Class', value: this.formatWeaponClass(f.weaponClass) },
      { label: 'Strategy', value: this.formatStrategy(f.strategy) },
    ];
  }

  private addLeagueSection(
    root: Phaser.GameObjects.Container,
    f: LoadedFighter,
    x: number,
    y: number,
    w: number,
  ): number {
    const parsed = this.parseRecord(f);
    const leagueBot = getProLeagueBot(f.id);
    const group = leagueBot?.group;
    const recordColor = this.recordValueColor(parsed);
    const sectionH = 72;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(x + 10, y, w - 20, sectionH, 6);
    bg.lineStyle(1, Phaser.Display.Color.HexStringToColor(recordColor).color, 0.35);
    bg.strokeRoundedRect(x + 10, y, w - 20, sectionH, 6);
    root.add(bg);

    const header = group
      ? `PRO LEAGUE · GROUP ${group}`
      : 'PRO LEAGUE';
    root.add(
      this.add
        .text(x + 18, y + 8, header, {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          fontStyle: '700',
          color: f.accentHex,
        })
        .setOrigin(0, 0),
    );

    if (parsed.form === 'unknown') {
      root.add(
        this.add
          .text(x + 18, y + 30, 'No scraped season record for this bot.', {
            fontFamily: HUD_FONT,
            fontSize: '9px',
            color: '#8a93a5',
          })
          .setOrigin(0, 0),
      );
      return sectionH + 8;
    }

    const recordText = `${parsed.wins} - ${parsed.losses}`;
    const winPct = `${Math.round(parsed.winRate * 100)}%`;
    const wlDetail = `${parsed.wins} W · ${parsed.losses} L`;

    root.add(
      this.add
        .text(x + 18, y + 24, 'RECORD', {
          fontFamily: HUD_FONT,
          fontSize: '7px',
          fontStyle: '700',
          color: '#6d7688',
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(x + 18, y + 36, recordText, {
          fontFamily: HUD_FONT,
          fontSize: '20px',
          fontStyle: '700',
          color: recordColor,
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(x + 18, y + 58, wlDetail, {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          color: '#b8c0cc',
        })
        .setOrigin(0, 0),
    );

    const midX = x + w * 0.38;
    root.add(
      this.add
        .text(midX, y + 24, 'WIN RATE', {
          fontFamily: HUD_FONT,
          fontSize: '7px',
          fontStyle: '700',
          color: '#6d7688',
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(midX, y + 36, winPct, {
          fontFamily: HUD_FONT,
          fontSize: '16px',
          fontStyle: '700',
          color: recordColor,
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(midX, y + 58, this.recordFormLabel(parsed), {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          fontStyle: '700',
          color: recordColor,
        })
        .setOrigin(0, 0),
    );

    const rightX = x + w * 0.68;
    root.add(
      this.add
        .text(rightX, y + 24, 'STAT BOOST', {
          fontFamily: HUD_FONT,
          fontSize: '7px',
          fontStyle: '700',
          color: '#6d7688',
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(rightX, y + 36, this.leagueStatModifier(parsed), {
          fontFamily: HUD_FONT,
          fontSize: '9px',
          fontStyle: '700',
          color: '#e8ecf2',
          wordWrap: { width: w * 0.28 },
        })
        .setOrigin(0, 0),
    );
    root.add(
      this.add
        .text(rightX, y + 58, 'from scraped W-L', {
          fontFamily: HUD_FONT,
          fontSize: '7px',
          color: '#6d7688',
        })
        .setOrigin(0, 0),
    );

    return sectionH + 8;
  }

  private addStatGrid(
    root: Phaser.GameObjects.Container,
    rows: StatRow[],
    x: number,
    y: number,
    w: number,
    title: string,
    accentHex: string,
  ): void {
    root.add(
      this.add
        .text(x + 14, y, title, {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          fontStyle: '700',
          color: accentHex,
        })
        .setOrigin(0, 0),
    );

    const colW = (w - 28) / 2;
    const labelX = x + 14;
    const valueX = x + 14 + colW * 0.42;
    const col2LabelX = x + 14 + colW;
    const col2ValueX = x + 14 + colW + colW * 0.42;
    const rowH = 16;
    const tableTop = y + 14;

    const g = this.add.graphics();
    g.lineStyle(1, 0xffffff, 0.06);
    g.lineBetween(x + 10, tableTop - 2, x + w - 10, tableTop - 2);
    root.add(g);

    rows.forEach((row, i) => {
      const col = i % 2;
      const rowIdx = Math.floor(i / 2);
      const ry = tableTop + rowIdx * rowH;
      const lx = col === 0 ? labelX : col2LabelX;
      const vx = col === 0 ? valueX : col2ValueX;

      root.add(
        this.add
          .text(lx, ry, row.label, {
            fontFamily: HUD_FONT,
            fontSize: '8px',
            color: '#6d7688',
          })
          .setOrigin(0, 0),
      );
      root.add(
        this.add
          .text(vx, ry, row.value, {
            fontFamily: HUD_FONT,
            fontSize: '8px',
            fontStyle: '700',
            color: row.valueColor ?? '#e8ecf2',
          })
          .setOrigin(0, 0),
      );
    });
  }

  private addStatsTable(
    root: Phaser.GameObjects.Container,
    f: LoadedFighter,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const panel = this.add.graphics();
    panel.fillStyle(0x0e121a, 0.92);
    panel.fillRoundedRect(x, y, w, h, 8);
    panel.lineStyle(1, f.accent, 0.45);
    panel.strokeRoundedRect(x, y, w, h, 8);
    root.add(panel);

    const leagueOffset = this.addLeagueSection(root, f, x, y + 8, w);
    this.addStatGrid(
      root,
      this.combatStatRows(f),
      x,
      y + 8 + leagueOffset + 4,
      w,
      'COMBAT STATS',
      f.accentHex,
    );
  }

  private get selected(): FighterDef {
    return this.selectable[this.selectedIndex]!;
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(DEPTH.studio);
    g.fillGradientStyle(0x0a0c12, 0x0a0c12, 0x0c1210, 0x0c1210, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const accent = this.selected.accent;
    g.fillStyle(accent, 0.06);
    g.fillCircle(LAYOUT.portraitX, LAYOUT.portraitY, 120);
    g.fillStyle(accent, 0.03);
    g.fillCircle(LAYOUT.portraitX, LAYOUT.portraitY, 170);

    const rosterTop = LAYOUT.rosterRow1Y - LAYOUT.thumbH / 2 - 10;
    g.fillStyle(0x080a10, 0.55);
    g.fillRect(0, rosterTop, GAME_WIDTH, GAME_HEIGHT - rosterTop);

    g.lineStyle(1, 0xffffff, 0.08);
    g.lineBetween(16, rosterTop, GAME_WIDTH - 16, rosterTop);
    g.fillStyle(0xf7d038, 0.85);
    for (let x = 0; x < GAME_WIDTH; x += 28) {
      g.fillRect(x, GAME_HEIGHT - 40, 14, 6);
    }
    g.fillStyle(0x0a0c12, 1);
    for (let x = 14; x < GAME_WIDTH; x += 28) {
      g.fillRect(x, GAME_HEIGHT - 40, 14, 6);
    }

    g.lineStyle(1, 0xffffff, 0.03);
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      g.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  private drawHeader(): void {
    this.add
      .text(GAME_WIDTH / 2, 18, 'BATTLEBOTS', {
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
        50,
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
          76,
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
    const contentH = LAYOUT.contentBottom - LAYOUT.contentTop;

    const root = this.add.container(0, 0).setDepth(DEPTH.hud);
    this.featureRoot = root;

    // Left panel — portrait & identity
    const leftPanel = this.add.graphics();
    leftPanel.fillStyle(0x0e121a, 0.94);
    leftPanel.fillRoundedRect(LAYOUT.leftX, LAYOUT.contentTop, LAYOUT.leftW, contentH, 10);
    leftPanel.lineStyle(2, f.accent, 1);
    leftPanel.strokeRoundedRect(LAYOUT.leftX, LAYOUT.contentTop, LAYOUT.leftW, contentH, 10);
    root.add(leftPanel);

    const halo = this.add.graphics();
    halo.fillStyle(f.accent, 0.16);
    halo.fillCircle(LAYOUT.portraitX, LAYOUT.portraitY, 58);
    halo.fillStyle(f.accent, 0.07);
    halo.fillCircle(LAYOUT.portraitX, LAYOUT.portraitY, 78);
    root.add(halo);

    const portrait = this.add
      .image(LAYOUT.portraitX, LAYOUT.portraitY, f.portraitKey)
      .setOrigin(0.5);
    const maxH = 108;
    const maxW = 220;
    portrait.setScale(Math.min(maxH / portrait.height, maxW / portrait.width, 1.1));
    root.add(portrait);

    const nameY = LAYOUT.contentTop + 168;
    root.add(
      this.add
        .text(LAYOUT.leftX + LAYOUT.leftW / 2, nameY, f.name, {
          fontFamily: HUD_FONT,
          fontSize: '17px',
          fontStyle: '700',
          color: f.accentHex,
          align: 'center',
          wordWrap: { width: LAYOUT.leftW - 24 },
        })
        .setOrigin(0.5, 0),
    );

    root.add(
      this.add
        .text(LAYOUT.leftX + LAYOUT.leftW / 2, nameY + 26, f.weaponLabel, {
          fontFamily: HUD_FONT,
          fontSize: '9px',
          fontStyle: '700',
          color: '#8a93a5',
          align: 'center',
          wordWrap: { width: LAYOUT.leftW - 24 },
        })
        .setOrigin(0.5, 0),
    );

    root.add(
      this.add
        .text(LAYOUT.leftX + LAYOUT.leftW / 2, nameY + 48, f.strategyNotes, {
          fontFamily: HUD_FONT,
          fontSize: '8px',
          color: '#b8c0cc',
          align: 'center',
          wordWrap: { width: LAYOUT.leftW - 28 },
          lineSpacing: 3,
        })
        .setOrigin(0.5, 0),
    );

    // Right panel — full stats table
    this.addStatsTable(
      root,
      f,
      LAYOUT.rightX,
      LAYOUT.contentTop,
      LAYOUT.rightW,
      contentH,
    );

    // Nav chevrons
    const chevronY = LAYOUT.contentTop + contentH / 2;
    root.add(
      this.add
        .text(LAYOUT.leftX - 8, chevronY, '‹', {
          fontFamily: HUD_FONT,
          fontSize: '32px',
          color: '#ffffff',
        })
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.shift(-1)),
    );
    root.add(
      this.add
        .text(LAYOUT.rightX + LAYOUT.rightW + 8, chevronY, '›', {
          fontFamily: HUD_FONT,
          fontSize: '32px',
          color: '#ffffff',
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.shift(1)),
    );

    const hit = this.add
      .rectangle(
        LAYOUT.leftX,
        LAYOUT.contentTop,
        LAYOUT.leftW + LAYOUT.rightW + 12,
        contentH,
        0x000000,
        0.001,
      )
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.confirm());
    root.add(hit);

    this.refreshThumbBorders();
  }

  private drawRosterRow(): void {
    this.thumbBorders = [];
    const thumbW = LAYOUT.thumbW;
    const thumbH = LAYOUT.thumbH;
    const halfW = thumbW / 2;
    const halfH = thumbH / 2;

    for (const row of this.rosterRows()) {
      const startX = GAME_WIDTH / 2 - ((row.items.length - 1) * row.gap) / 2;

      row.items.forEach((item, i) => {
        const x = startX + i * row.gap;
        const y = row.y;
        const border = this.add.graphics().setDepth(DEPTH.hud);
        this.thumbBorders.push(border);

        if (item.kind === 'fighter') {
          const f = item.fighter;
          border.fillStyle(0x0a0e16, 0.92);
          border.fillRoundedRect(x - halfW, y - halfH, thumbW, thumbH, 6);

          const thumbHalo = this.add.graphics().setDepth(DEPTH.hud);
          thumbHalo.fillStyle(f.accent, 0.22);
          thumbHalo.fillCircle(x, y - 4, 22);
          thumbHalo.fillStyle(f.accent, 0.1);
          thumbHalo.fillCircle(x, y - 4, 28);

          this.add
            .image(x, y - 2, f.hudKey)
            .setScale(1.05)
            .setDepth(DEPTH.hud);

          this.add
            .text(x, y + halfH + 4, f.shortName.slice(0, 8), {
              fontFamily: HUD_FONT,
              fontSize: '7px',
              fontStyle: '700',
              color: f.accentHex,
            })
            .setOrigin(0.5, 0)
            .setDepth(DEPTH.hud);

          const hit = this.add
            .rectangle(x, y, thumbW, thumbH, 0x000000, 0.001)
            .setInteractive({ useHandCursor: true })
            .setDepth(DEPTH.hud + 1);
          hit.on('pointerdown', () => {
            this.selectedIndex = this.selectable.findIndex((x) => x.id === f.id);
            this.rebuildFeatured();
          });
        } else {
          border.fillStyle(0x0a0e16, 0.9);
          border.fillRoundedRect(x - halfW, y - halfH, thumbW, thumbH, 6);
          border.lineStyle(1, item.slot.accent, 0.3);
          border.strokeRoundedRect(x - halfW, y - halfH, thumbW, thumbH, 6);

          this.add
            .text(x, y - 4, '???', {
              fontFamily: HUD_FONT,
              fontSize: '14px',
              fontStyle: '700',
              color: '#4a5160',
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.hud);

          this.add
            .text(x, y + 12, item.slot.label, {
              fontFamily: HUD_FONT,
              fontSize: '7px',
              color: '#5a6274',
            })
            .setOrigin(0.5)
            .setDepth(DEPTH.hud);
        }
      });
    }

    this.refreshThumbBorders();
  }

  private refreshThumbBorders(): void {
    const thumbW = LAYOUT.thumbW;
    const thumbH = LAYOUT.thumbH;
    const halfW = thumbW / 2;
    const halfH = thumbH / 2;
    let borderIdx = 0;

    for (const row of this.rosterRows()) {
      const startX = GAME_WIDTH / 2 - ((row.items.length - 1) * row.gap) / 2;

      row.items.forEach((item, i) => {
        const x = startX + i * row.gap;
        const y = row.y;
        const border = this.thumbBorders[borderIdx++];
        if (!border || item.kind !== 'fighter') return;
        border.clear();
        border.fillStyle(0x0a0e16, 0.92);
        border.fillRoundedRect(x - halfW, y - halfH, thumbW, thumbH, 6);
        const selected = item.fighter.id === this.selected.id;
        border.lineStyle(2, selected ? item.fighter.accent : 0x2a3040, selected ? 1 : 0.5);
        border.strokeRoundedRect(x - halfW, y - halfH, thumbW, thumbH, 6);
      });
    }
  }

  private drawFooter(): void {
    const hint =
      this.step === 'player'
        ? '← → SELECT   ·   ENTER — CHOOSE OPPONENT'
        : '← → SELECT   ·   ENTER — FIGHT   ·   BACKSPACE — BACK';
    this.confirmHint = this.add
      .text(GAME_WIDTH / 2, LAYOUT.footerY, hint, {
        fontFamily: HUD_FONT,
        fontSize: '10px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.hud);
  }

  private setupInput(): void {
    this.teardownInput();
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    const handlers = {
      confirm: () => this.confirm(),
      shiftLeft: () => this.shift(-1),
      shiftRight: () => this.shift(1),
      goBack: () => this.goBack(),
    };
    this.inputHandlers = handlers;

    keyboard.on('keydown-ENTER', handlers.confirm);
    keyboard.on('keydown-SPACE', handlers.confirm);
    keyboard.on('keydown-LEFT', handlers.shiftLeft);
    keyboard.on('keydown-RIGHT', handlers.shiftRight);
    keyboard.on('keydown-A', handlers.shiftLeft);
    keyboard.on('keydown-D', handlers.shiftRight);
    keyboard.on('keydown-BACKSPACE', handlers.goBack);
  }

  private teardownInput(): void {
    const keyboard = this.input.keyboard;
    const handlers = this.inputHandlers;
    if (!keyboard || !handlers) return;

    keyboard.off('keydown-ENTER', handlers.confirm);
    keyboard.off('keydown-SPACE', handlers.confirm);
    keyboard.off('keydown-LEFT', handlers.shiftLeft);
    keyboard.off('keydown-RIGHT', handlers.shiftRight);
    keyboard.off('keydown-A', handlers.shiftLeft);
    keyboard.off('keydown-D', handlers.shiftRight);
    keyboard.off('keydown-BACKSPACE', handlers.goBack);
    this.inputHandlers = undefined;
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

    // User gesture — unlock Web Audio + prime TTS so the arena intro can play.
    sfx.unlock();
    sfx.primeSpeech();

    this.registry.set(REGISTRY_PLAYER_FIGHTER, this.playerPickId);
    this.registry.set(REGISTRY_OPPONENT_FIGHTER, this.selected.id);
    this.scene.start('ArenaScene');
  }
}
