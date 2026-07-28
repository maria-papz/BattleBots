import Phaser from 'phaser';
import {
  COLORS,
  DEPTH,
  ENEMY_ORANGE,
  GAME_HEIGHT,
  GAME_WIDTH,
  HP_GREEN,
  HUD_FONT,
  PIXEL_FONT,
  PLAYER_CYAN,
  TEXTURE_KEYS,
} from '../constants';

/**
 * Locked to desired-ui.png:
 * Asymmetric tech panels, HP text under bar, WEAPON=8 / ATK=4 segments,
 * Orbitron HUD type, team-colored name labels.
 */
export class BattleHud {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly playerFill: Phaser.GameObjects.Rectangle;
  private readonly enemyFill: Phaser.GameObjects.Rectangle;
  private readonly playerHpText: Phaser.GameObjects.Text;
  private readonly enemyHpText: Phaser.GameObjects.Text;
  private readonly playerWeaponSegs: Phaser.GameObjects.Rectangle[];
  private readonly enemyWeaponSegs: Phaser.GameObjects.Rectangle[];
  private readonly playerAtkSegs: Phaser.GameObjects.Rectangle[];
  private readonly enemyAtkSegs: Phaser.GameObjects.Rectangle[];
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly banner: Phaser.GameObjects.Container;
  private readonly bannerTitle: Phaser.GameObjects.Text;
  private readonly bannerSub: Phaser.GameObjects.Text;
  private lastTimer = '';
  private lastStatus = '';
  private playerHpDisplay = 100;
  private enemyHpDisplay = 100;
  private readonly hpWidth = 196;
  private readonly weaponSegCount = 8;
  private readonly atkSegCount = 4;

  constructor(
    scene: Phaser.Scene,
    opts?: {
      playerName?: string;
      playerAccent?: number;
      playerAccentHex?: string;
      playerIcon?: string;
      enemyName?: string;
    },
  ) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.hud);

    const playerName = opts?.playerName ?? 'PLAYER BOT';
    const playerAccent = opts?.playerAccent ?? PLAYER_CYAN;
    const playerAccentHex = opts?.playerAccentHex ?? '#27c5ff';
    const playerIcon = opts?.playerIcon ?? TEXTURE_KEYS.hudPlayer;
    const enemyName = opts?.enemyName ?? 'ENEMY BOT';

    const topY = 10;
    const left = this.makeFighterCard(
      12,
      topY,
      playerName,
      playerAccent,
      playerAccentHex,
      playerIcon,
      true,
    );
    const right = this.makeFighterCard(
      GAME_WIDTH - 12,
      topY,
      enemyName,
      ENEMY_ORANGE,
      '#ff5c4d',
      TEXTURE_KEYS.hudEnemy,
      false,
    );
    const mid = this.makeCenterCard(GAME_WIDTH / 2, topY + 2);

    // Desired: WEAPON + ATK sit in thin bordered sub-panels under fighter cards
    const lw = this.makeMeterPanel(12, topY + 58, true, playerAccent, 'WEAPON', this.weaponSegCount, 16, 3);
    const la = this.makeMeterPanel(12, topY + 84, true, playerAccent, 'ATK', this.atkSegCount, 28, 4);
    const rw = this.makeMeterPanel(GAME_WIDTH - 12, topY + 58, false, ENEMY_ORANGE, 'WEAPON', this.weaponSegCount, 16, 3);
    const ra = this.makeMeterPanel(GAME_WIDTH - 12, topY + 84, false, ENEMY_ORANGE, 'ATK', this.atkSegCount, 28, 4);
    this.playerWeaponSegs = lw.segs;
    this.playerAtkSegs = la.segs;
    this.enemyWeaponSegs = rw.segs;
    this.enemyAtkSegs = ra.segs;
    this.root.add([lw.container, la.container, rw.container, ra.container]);

    this.playerFill = left.fill;
    this.playerHpText = left.hpText;
    this.enemyFill = right.fill;
    this.enemyHpText = right.hpText;
    this.timerText = mid.timer;

    this.root.add([left.container, right.container, mid.container, this.makeBottomRow()]);

    const ban = this.makeBanner();
    this.banner = ban.container;
    this.bannerTitle = ban.title;
    this.bannerSub = ban.sub;
    this.root.add(this.banner);
  }

  /**
   * Asymmetric tech plate: small cuts on outer-top, long cut on inner-bottom
   * matching the desired fighter card silhouette.
   */
  private techPanel(
    x: number,
    y: number,
    w: number,
    h: number,
    border: number,
    isLeft: boolean,
  ): Phaser.GameObjects.Container {
    const g = this.scene.add.graphics();
    const small = 6;
    const long = 16;
    const L = 0;
    const R = w;
    const T = 0;
    const B = h;

    // Outer glow
    g.lineStyle(5, border, 0.2);
    this.fillTechPath(g, L - 1, T - 1, R + 1, B + 1, small + 1, long + 1, isLeft, true);

    g.fillStyle(0x0e121a, 0.95);
    this.fillTechPath(g, L, T, R, B, small, long, isLeft, false);

    g.lineStyle(2, border, 1);
    this.fillTechPath(g, L, T, R, B, small, long, isLeft, true);

    g.lineStyle(1, 0xffffff, 0.08);
    g.strokeRect(L + 4, T + 4, w - 8, h - 8);

    const c = this.scene.add.container(x, y, [g]);
    if (!isLeft) {
      // Mirror: draw with left=true then flip by positioning origin on right
      // Actually we draw mirrored path via isLeft flag — place with origin top-right
    }
    // Position: left panel origin top-left; right panel origin top-right
    if (!isLeft) {
      c.setPosition(x - w, y);
    }
    return c;
  }

  private fillTechPath(
    g: Phaser.GameObjects.Graphics,
    L: number,
    T: number,
    R: number,
    B: number,
    small: number,
    longCut: number,
    isLeft: boolean,
    strokeOnly: boolean,
  ): void {
    g.beginPath();
    if (isLeft) {
      // Small cut top-left, small top-right, small bottom-left, LONG cut bottom-right
      g.moveTo(L + small, T);
      g.lineTo(R - small, T);
      g.lineTo(R, T + small);
      g.lineTo(R, B - longCut);
      g.lineTo(R - longCut, B);
      g.lineTo(L + small, B);
      g.lineTo(L, B - small);
      g.lineTo(L, T + small);
    } else {
      // Mirror: long cut bottom-left, small cuts elsewhere
      g.moveTo(L + small, T);
      g.lineTo(R - small, T);
      g.lineTo(R, T + small);
      g.lineTo(R, B - small);
      g.lineTo(R - small, B);
      g.lineTo(L + longCut, B);
      g.lineTo(L, B - longCut);
      g.lineTo(L, T + small);
    }
    g.closePath();
    if (strokeOnly) g.strokePath();
    else g.fillPath();
  }

  private makeFighterCard(
    x: number,
    y: number,
    label: string,
    accent: number,
    accentHex: string,
    iconKey: string,
    isLeft: boolean,
  ): {
    container: Phaser.GameObjects.Container;
    fill: Phaser.GameObjects.Rectangle;
    hpText: Phaser.GameObjects.Text;
  } {
    const w = 300;
    const h = 54;
    const panel = this.techPanel(x, y, w, h, accent, isLeft);

    // Content coords are local to panel (left edge = 0 after techPanel placement)
    const iconX = isLeft ? 28 : w - 28;
    const contentX = isLeft ? 54 : 12;
    const frameX = isLeft ? 10 : w - 46;

    const frame = this.scene.add.graphics();
    frame.fillStyle(0x0a0e16, 1);
    frame.fillRect(frameX, 8, 36, 36);
    frame.lineStyle(2, accent, 1);
    frame.strokeRect(frameX, 8, 36, 36);
    panel.add(frame);

    panel.add(
      this.scene.add.image(iconX, 26, iconKey).setOrigin(0.5).setScale(1),
    );

    const name = this.scene.add.text(isLeft ? contentX : w - 54, 6, label, {
      fontFamily: HUD_FONT,
      fontSize: '11px',
      fontStyle: '700',
      color: accentHex,
    });
    if (!isLeft) name.setOrigin(1, 0);
    panel.add(name);

    const hpX = contentX;
    const hpTrack = this.scene.add
      .rectangle(hpX, 24, this.hpWidth, 14, 0x0a0e16)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x4a5160, 0.85);
    const hpGlow = this.scene.add
      .rectangle(hpX - 1, 22, this.hpWidth + 2, 18, HP_GREEN, 0.16)
      .setOrigin(0, 0);
    const fill = this.scene.add
      .rectangle(hpX, 24, this.hpWidth, 14, HP_GREEN)
      .setOrigin(0, 0);

    const capL = this.scene.add.circle(hpX + 1, 31, 7, HP_GREEN);
    const capR = this.scene.add.circle(hpX + this.hpWidth - 1, 31, 7, HP_GREEN);

    const hpText = this.scene.add
      .text(hpX + this.hpWidth, 40, '100/100', {
        fontFamily: HUD_FONT,
        fontSize: '10px',
        color: '#ffffff',
      })
      .setOrigin(1, 0);

    panel.add([hpGlow, hpTrack, fill, capL, capR, hpText]);

    (fill as Phaser.GameObjects.Rectangle & { _caps?: Phaser.GameObjects.Arc[] })._caps = [
      capL,
      capR,
    ];

    return { container: panel, fill, hpText };
  }

  private makeMeterPanel(
    x: number,
    y: number,
    isLeft: boolean,
    accent: number,
    label: string,
    count: number,
    segW: number,
    gap: number,
  ): { container: Phaser.GameObjects.Container; segs: Phaser.GameObjects.Rectangle[] } {
    const w = 300;
    const h = 24;
    const panel = this.techPanel(x, y, w, h, accent, isLeft);
    const accentHex = `#${accent.toString(16).padStart(6, '0')}`;
    const labelW = 70;
    const segs: Phaser.GameObjects.Rectangle[] = [];

    if (isLeft) {
      panel.add(
        this.scene.add.text(10, 6, label, {
          fontFamily: HUD_FONT,
          fontSize: '10px',
          fontStyle: '700',
          color: accentHex,
        }),
      );
      const startX = labelW;
      for (let i = 0; i < count; i++) {
        const sx = startX + i * (segW + gap);
        const track = this.scene.add
          .rectangle(sx, 6, segW, 12, 0x0a0e16)
          .setOrigin(0, 0)
          .setStrokeStyle(1, accent, 0.55);
        const seg = this.scene.add.rectangle(sx, 6, segW, 12, accent).setOrigin(0, 0);
        segs.push(seg);
        panel.add([track, seg]);
      }
    } else {
      panel.add(
        this.scene.add
          .text(w - 10, 6, label, {
            fontFamily: HUD_FONT,
            fontSize: '10px',
            fontStyle: '700',
            color: accentHex,
          })
          .setOrigin(1, 0),
      );
      const totalW = count * (segW + gap) - gap;
      const startX = w - 10 - labelW - totalW;
      for (let i = 0; i < count; i++) {
        const sx = startX + i * (segW + gap);
        const track = this.scene.add
          .rectangle(sx, 6, segW, 12, 0x0a0e16)
          .setOrigin(0, 0)
          .setStrokeStyle(1, accent, 0.55);
        const seg = this.scene.add.rectangle(sx, 6, segW, 12, accent).setOrigin(0, 0);
        segs.push(seg);
        panel.add([track, seg]);
      }
    }
    return { container: panel, segs };
  }

  private makeCenterCard(
    x: number,
    y: number,
  ): { container: Phaser.GameObjects.Container; timer: Phaser.GameObjects.Text } {
    const w = 130;
    const h = 50;
    const g = this.scene.add.graphics();
    const cut = 12;
    g.lineStyle(5, PLAYER_CYAN, 0.2);
    this.strokeSym(g, -w / 2 - 1, -1, w / 2 + 1, h + 1, cut + 1);
    g.fillStyle(0x0e121a, 0.95);
    g.beginPath();
    g.moveTo(-w / 2 + cut, 0);
    g.lineTo(w / 2 - cut, 0);
    g.lineTo(w / 2, cut);
    g.lineTo(w / 2, h - cut);
    g.lineTo(w / 2 - cut, h);
    g.lineTo(-w / 2 + cut, h);
    g.lineTo(-w / 2, h - cut);
    g.lineTo(-w / 2, cut);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, PLAYER_CYAN, 1);
    this.strokeSym(g, -w / 2, 0, w / 2, h, cut);

    const panel = this.scene.add.container(x, y, [g]);
    panel.add(
      this.scene.add
        .text(0, 6, 'ROUND 1', {
          fontFamily: HUD_FONT,
          fontSize: '10px',
          fontStyle: '700',
          color: '#27c5ff',
        })
        .setOrigin(0.5, 0),
    );
    const timer = this.scene.add
      .text(0, 20, '03:00', {
        fontFamily: HUD_FONT,
        fontSize: '22px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0);
    panel.add(timer);
    return { container: panel, timer };
  }

  private strokeSym(
    g: Phaser.GameObjects.Graphics,
    L: number,
    T: number,
    R: number,
    B: number,
    cut: number,
  ): void {
    g.beginPath();
    g.moveTo(L + cut, T);
    g.lineTo(R - cut, T);
    g.lineTo(R, T + cut);
    g.lineTo(R, B - cut);
    g.lineTo(R - cut, B);
    g.lineTo(L + cut, B);
    g.lineTo(L, B - cut);
    g.lineTo(L, T + cut);
    g.closePath();
    g.strokePath();
  }

  private keycap(label: string, x: number, y: number, w = 22): Phaser.GameObjects.Container {
    const g = this.scene.add.graphics();
    g.fillStyle(0x1a2030, 1);
    g.fillRect(0, 0, w, 16);
    g.lineStyle(1, 0xc8d0dc, 1);
    g.strokeRect(0, 0, w, 16);
    const t = this.scene.add
      .text(w / 2, 3, label, {
        fontFamily: HUD_FONT,
        fontSize: '9px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0);
    return this.scene.add.container(x, y, [g, t]);
  }

  private makeBottomRow(): Phaser.GameObjects.Container {
    const y = GAME_HEIGHT - 58;
    const h = 52;

    const makeBottom = (bx: number, bw: number, originRight: boolean) => {
      const g = this.scene.add.graphics();
      const cut = 8;
      const L = originRight ? -bw : 0;
      const R = originRight ? 0 : bw;
      g.lineStyle(4, PLAYER_CYAN, 0.18);
      this.strokeSym(g, L - 1, -1, R + 1, h + 1, cut + 1);
      g.fillStyle(0x0e121a, 0.95);
      g.beginPath();
      g.moveTo(L + cut, 0);
      g.lineTo(R - cut, 0);
      g.lineTo(R, cut);
      g.lineTo(R, h - cut);
      g.lineTo(R - cut, h);
      g.lineTo(L + cut, h);
      g.lineTo(L, h - cut);
      g.lineTo(L, cut);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, PLAYER_CYAN, 1);
      this.strokeSym(g, L, 0, R, h, cut);
      return this.scene.add.container(bx, y, [g]);
    };

    const left = makeBottom(8, 300, false);
    const mid = makeBottom(GAME_WIDTH / 2, 292, false);
    mid.x = GAME_WIDTH / 2 - 146;
    const right = makeBottom(GAME_WIDTH - 8, 300, true);

    const cTitle = this.scene.add.text(18, y + 4, 'CONTROLS', {
      fontFamily: HUD_FONT,
      fontSize: '10px',
      fontStyle: '700',
      color: '#27c5ff',
    });

    const keys = this.scene.add.container(18, y + 18, [
      this.keycap('W', 0, 0),
      this.scene.add.text(12, 18, 'MOVE', {
        fontFamily: HUD_FONT,
        fontSize: '8px',
        color: '#c8d0dc',
      }).setOrigin(0.5, 0),
      this.keycap('A', 48, 0),
      this.keycap('D', 72, 0),
      this.scene.add.text(70, 18, 'TURN', {
        fontFamily: HUD_FONT,
        fontSize: '8px',
        color: '#c8d0dc',
      }).setOrigin(0.5, 0),
      this.keycap('SPACE', 112, 0, 48),
      this.scene.add.text(136, 18, 'ATTACK', {
        fontFamily: HUD_FONT,
        fontSize: '8px',
        color: '#c8d0dc',
      }).setOrigin(0.5, 0),
      this.keycap('ESC', 178, 0, 28),
      this.scene.add.text(192, 18, 'PAUSE', {
        fontFamily: HUD_FONT,
        fontSize: '8px',
        color: '#c8d0dc',
      }).setOrigin(0.5, 0),
      this.keycap('R', 230, 0),
      this.scene.add.text(241, 18, 'RESTART', {
        fontFamily: HUD_FONT,
        fontSize: '8px',
        color: '#c8d0dc',
      }).setOrigin(0.5, 0),
    ]);

    const mTitle = this.scene.add
      .text(GAME_WIDTH / 2, y + 6, 'MATCH INFO', {
        fontFamily: HUD_FONT,
        fontSize: '10px',
        fontStyle: '700',
        color: '#27c5ff',
      })
      .setOrigin(0.5, 0);
    const mBody = this.scene.add
      .text(
        GAME_WIDTH / 2,
        y + 26,
        'DESTROY YOUR OPPONENT BEFORE YOURSELF!',
        {
          fontFamily: HUD_FONT,
          fontSize: '10px',
          fontStyle: '700',
          color: '#ffffff',
          align: 'center',
        },
      )
      .setOrigin(0.5, 0);

    const lTitle = this.scene.add
      .text(GAME_WIDTH - 18, y + 4, 'LEGEND', {
        fontFamily: HUD_FONT,
        fontSize: '10px',
        fontStyle: '700',
        color: '#27c5ff',
      })
      .setOrigin(1, 0);

    const legend = this.scene.add.container(GAME_WIDTH - 292, y + 22, [
      this.scene.add.image(8, 4, TEXTURE_KEYS.legendYou).setScale(1.1),
      this.scene.add.text(20, 0, 'YOU', {
        fontFamily: HUD_FONT,
        fontSize: '9px',
        color: '#c8d0dc',
      }),
      this.scene.add.image(70, 4, TEXTURE_KEYS.legendEnemy).setScale(1.1),
      this.scene.add.text(82, 0, 'ENEMY', {
        fontFamily: HUD_FONT,
        fontSize: '9px',
        color: '#c8d0dc',
      }),
      this.scene.add.image(148, 4, TEXTURE_KEYS.legendHazard).setScale(1.1),
      this.scene.add.text(160, 0, 'HAZARD', {
        fontFamily: HUD_FONT,
        fontSize: '9px',
        color: '#c8d0dc',
      }),
      this.scene.add.image(228, 4, TEXTURE_KEYS.legendSpike).setScale(1.1),
      this.scene.add.text(240, 0, 'HAZARD', {
        fontFamily: HUD_FONT,
        fontSize: '9px',
        color: '#c8d0dc',
      }),
    ]);

    return this.scene.add.container(0, 0, [
      left,
      mid,
      right,
      cTitle,
      keys,
      mTitle,
      mBody,
      lTitle,
      legend,
    ]);
  }

  private makeBanner(): {
    container: Phaser.GameObjects.Container;
    title: Phaser.GameObjects.Text;
    sub: Phaser.GameObjects.Text;
  } {
    const g = this.scene.add.graphics();
    g.fillStyle(0x12161e, 0.85);
    g.fillRoundedRect(-120, -28, 240, 56, 4);
    g.lineStyle(2, PLAYER_CYAN, 0.95);
    g.strokeRoundedRect(-120, -28, 240, 56, 4);
    const title = this.scene.add
      .text(0, -10, '', {
        fontFamily: HUD_FONT,
        fontSize: '18px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const sub = this.scene.add
      .text(0, 12, '', {
        fontFamily: HUD_FONT,
        fontSize: '10px',
        color: '#27c5ff',
      })
      .setOrigin(0.5);
    const container = this.scene.add.container(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 8,
      [g, title, sub],
    );
    container.setVisible(false);
    return { container, title, sub };
  }

  setHealth(
    playerHp: number,
    playerMax: number,
    enemyHp: number,
    enemyMax: number,
  ): void {
    this.tweenHp('player', playerHp, playerMax, this.playerFill, this.playerHpText);
    this.tweenHp('enemy', enemyHp, enemyMax, this.enemyFill, this.enemyHpText);
  }

  private tweenHp(
    which: 'player' | 'enemy',
    target: number,
    max: number,
    fill: Phaser.GameObjects.Rectangle,
    label: Phaser.GameObjects.Text,
  ): void {
    const current = which === 'player' ? this.playerHpDisplay : this.enemyHpDisplay;
    const apply = (v: number) => {
      if (which === 'player') this.playerHpDisplay = v;
      else this.enemyHpDisplay = v;
      const r = max <= 0 ? 0 : Math.max(0, Math.min(1, v / max));
      fill.width = this.hpWidth * r;
      const color = r > 0.5 ? HP_GREEN : r > 0.2 ? COLORS.bbYellow : ENEMY_ORANGE;
      fill.setFillStyle(color);
      const caps = (
        fill as Phaser.GameObjects.Rectangle & { _caps?: Phaser.GameObjects.Arc[] }
      )._caps;
      const capL = caps?.[0];
      const capR = caps?.[1];
      if (capL && capR) {
        capL.setFillStyle(color);
        capR.x = fill.x + fill.width - 1;
        capR.setFillStyle(color);
        capR.setVisible(r > 0.02);
      }
      label.setText(`${Math.ceil(v)}/${max}`);
    };

    if (Math.abs(current - target) < 0.1) {
      apply(target);
      return;
    }
    const proxy = { v: current };
    this.scene.tweens.add({
      targets: proxy,
      v: target,
      duration: 180,
      onUpdate: () => apply(proxy.v),
    });
  }

  setMeters(playerAtk: number, enemyAtk: number): void {
    this.applySegs(this.playerWeaponSegs, playerAtk, PLAYER_CYAN);
    this.applySegs(this.enemyWeaponSegs, enemyAtk, ENEMY_ORANGE);
    this.applySegs(this.playerAtkSegs, playerAtk >= 1 ? 1 : playerAtk, PLAYER_CYAN);
    this.applySegs(this.enemyAtkSegs, enemyAtk >= 1 ? 1 : enemyAtk, ENEMY_ORANGE);
  }

  private applySegs(
    segs: Phaser.GameObjects.Rectangle[],
    progress: number,
    color: number,
  ): void {
    const lit = Math.round(Math.max(0, Math.min(1, progress)) * segs.length);
    segs.forEach((seg, i) => {
      seg.setFillStyle(color, i < lit ? 1 : 0.15);
    });
  }

  setTimerMs(remainingMs: number): void {
    const clamped = Math.max(0, remainingMs);
    const totalSec = Math.ceil(clamped / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const text = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (text !== this.lastTimer) {
      this.lastTimer = text;
      this.timerText.setText(text);
      this.timerText.setColor(clamped <= 30000 ? '#ff5c4d' : '#ffffff');
    }
  }

  setMatchStatusLabel(_label: string): void {}

  setStatus(title: string, subtitle = ''): void {
    const key = `${title}|${subtitle}`;
    if (key === this.lastStatus) return;
    this.lastStatus = key;
    this.bannerTitle.setText(title);
    this.bannerSub.setText(subtitle);
    this.banner.setVisible(title.length > 0);
  }

  floatCallout(x: number, y: number, text: string, color: string): void {
    const t = this.scene.add
      .text(x, y - 20, text, {
        fontFamily: PIXEL_FONT,
        fontSize: '8px',
        color,
        stroke: '#0a0c12',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.fx);
    this.scene.tweens.add({
      targets: t,
      y: y - 48,
      alpha: 0,
      duration: 650,
      onComplete: () => t.destroy(),
    });
  }

  /** Root container for camera ignore / HUD camera binding. */
  getRoot(): Phaser.GameObjects.Container {
    return this.root;
  }

  destroy(): void {
    this.root.destroy(true);
  }
}
