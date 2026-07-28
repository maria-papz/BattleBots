import Phaser from 'phaser';
import {
  ENEMY_ORANGE,
  HAZARD_YELLOW,
  HUD_FONT,
  PLAYER_CYAN,
  TEXTURE_KEYS,
} from '../constants';
import { generateBloodsportTextures } from './bloodsport';
import { generateCobaltTextures } from './cobalt';
import { generateCopperheadTextures } from './copperhead';
import { generateDeathRollTextures } from './deathroll';
import { generateDisarrayTextures } from './disarray';
import { generateEndGameTextures } from './endgame';
import { generateGoldenFuryTextures } from './goldenfury';
import { generateHugeTextures } from './huge';
import { generateHypershockTextures } from './hypershock';
import { generateJackpotTextures } from './jackpot';
import { generateMadCatterTextures } from './madcatter';
import { generateMagnitudeTextures } from './magnitude';
import { generateMaliceTextures } from './malice';
import { generateMantaTextures } from './manta';
import { generateMinotaurTextures } from './minotaur';
import { generateOrbitronTextures } from './orbitron';
import { generateRibbotTextures } from './ribbot';

/** Premium industrial sci-fi pixel textures matching the esports HUD mockup. */
export function generateGameTextures(scene: Phaser.Scene): void {
  makePlayerRobot(scene);
  makeEnemyRobot(scene);
  makePlayerWeapon(scene);
  makeEnemyWeapon(scene);
  generateBloodsportTextures(scene);
  generateCobaltTextures(scene);
  generateCopperheadTextures(scene);
  generateDeathRollTextures(scene);
  generateDisarrayTextures(scene);
  generateEndGameTextures(scene);
  generateGoldenFuryTextures(scene);
  generateHugeTextures(scene);
  generateHypershockTextures(scene);
  generateJackpotTextures(scene);
  generateMadCatterTextures(scene);
  generateMagnitudeTextures(scene);
  generateMaliceTextures(scene);
  generateMantaTextures(scene);
  generateMinotaurTextures(scene);
  generateOrbitronTextures(scene);
  generateRibbotTextures(scene);
  makeFloorTile(scene, TEXTURE_KEYS.floorTile, 0);
  makeFloorTile(scene, TEXTURE_KEYS.floorTileAlt, 1);
  makeWallTile(scene);
  makeHazardStripe(scene);
  makeSawtooth(scene);
  makeBbLogo(scene);
  makeStartPad(scene, TEXTURE_KEYS.startBlue, PLAYER_CYAN);
  makeStartPad(scene, TEXTURE_KEYS.startRed, ENEMY_ORANGE);
  makeHazardPad(scene);
  makePulverizer(scene);
  makeCagePost(scene);
  makeImpact(scene);
  makeHudPanel(scene);
  makeGlow(scene, TEXTURE_KEYS.glowBlue, PLAYER_CYAN);
  makeGlow(scene, TEXTURE_KEYS.glowRed, ENEMY_ORANGE);
  makeGlow(scene, TEXTURE_KEYS.glowYellow, HAZARD_YELLOW);
  makeSpark(scene);
  makeSmoke(scene);
  makeWarnLight(scene);
  makeNeonDot(scene);
  makeHudIcons(scene);
  makeLegendIcons(scene);
  makeWallFace(scene);
  makeFloorLight(scene, TEXTURE_KEYS.floorLightBlue, PLAYER_CYAN);
  makeFloorLight(scene, TEXTURE_KEYS.floorLightRed, ENEMY_ORANGE);
  stub(scene, TEXTURE_KEYS.star);
  stub(scene, TEXTURE_KEYS.crowd);
}

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 });
}

function stub(scene: Phaser.Scene, key: string): void {
  const g = gfx(scene);
  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 1, 1);
  g.generateTexture(key, 1, 1);
  g.destroy();
}

function makePlayerRobot(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 64;
  g.fillStyle(PLAYER_CYAN, 0.16);
  g.fillEllipse(s / 2, s / 2 + 20, 38, 10);
  g.fillStyle(0x000000, 0.5);
  g.fillEllipse(s / 2, s / 2 + 18, 32, 8);

  // Dark wedge + cyan armor plate (desired)
  g.fillStyle(0x0a0c12, 1);
  g.fillTriangle(8, 16, 8, 48, 46, 32);
  g.fillStyle(0x121820, 1);
  g.fillTriangle(12, 20, 12, 44, 40, 32);
  g.fillStyle(PLAYER_CYAN, 1);
  g.fillTriangle(16, 26, 16, 38, 32, 32);
  g.fillStyle(0xffffff, 0.4);
  g.fillRect(18, 30, 8, 2);

  g.fillStyle(0xd0d6e0, 1);
  g.fillTriangle(34, 27, 58, 32, 34, 37);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(38, 29, 52, 32, 38, 35);

  g.lineStyle(1, 0x000000, 0.85);
  g.strokeTriangle(8, 16, 8, 48, 46, 32);

  g.generateTexture(TEXTURE_KEYS.playerBody, s, s);
  g.destroy();
}

function makeEnemyRobot(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 64;
  g.fillStyle(ENEMY_ORANGE, 0.14);
  g.fillEllipse(s / 2, s / 2 + 20, 38, 10);
  g.fillStyle(0x000000, 0.5);
  g.fillEllipse(s / 2, s / 2 + 18, 32, 8);

  // Black/red boxy tank + silver drum (desired)
  g.fillStyle(0x0a0c10, 1);
  g.fillRect(12, 14, 28, 34);
  g.fillStyle(0x1a1012, 1);
  g.fillRect(14, 16, 24, 30);
  g.fillStyle(ENEMY_ORANGE, 1);
  g.fillRect(14, 16, 24, 12);
  g.fillStyle(0xff8a70, 1);
  g.fillRect(14, 16, 24, 3);
  g.fillStyle(0xffffff, 0.4);
  g.fillRect(18, 20, 12, 2);

  // Drum / spinner weapon
  g.fillStyle(0x8a93a5, 1);
  g.fillRect(38, 20, 16, 22);
  g.fillStyle(0xc8d0dc, 1);
  g.fillCircle(46, 31, 8);
  g.fillStyle(0x4a5160, 1);
  g.fillCircle(46, 31, 3);
  g.fillStyle(ENEMY_ORANGE, 1);
  g.fillRect(42, 24, 3, 14);

  g.lineStyle(1, 0x000000, 0.85);
  g.strokeRect(12, 14, 28, 34);

  g.generateTexture(TEXTURE_KEYS.enemyBody, s, s);
  g.destroy();
}

function makePlayerWeapon(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(PLAYER_CYAN, 0.45);
  g.fillTriangle(0, 8, 24, 1, 24, 15);
  g.fillStyle(0xe8f8ff, 1);
  g.fillRect(4, 5, 16, 6);
  g.generateTexture(TEXTURE_KEYS.playerWeapon, 26, 16);
  g.destroy();
}

function makeEnemyWeapon(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(ENEMY_ORANGE, 0.45);
  g.fillTriangle(0, 8, 24, 1, 24, 15);
  g.fillStyle(0xffd0c8, 1);
  g.fillRect(4, 5, 16, 6);
  g.generateTexture(TEXTURE_KEYS.enemyWeapon, 26, 16);
  g.destroy();
}

function makeFloorTile(scene: Phaser.Scene, key: string, variant: number): void {
  const g = gfx(scene);
  const s = 32;
  // Darker weathered steel — lit by ambient only
  const base = variant === 0 ? 0x12151c : 0x0e1118;
  g.fillStyle(base, 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(0x080a0e, 1);
  g.fillRect(0, 0, s, 1);
  g.fillRect(0, 0, 1, s);
  g.fillStyle(0x1c2230, 0.4);
  g.fillRect(1, 1, s - 2, 1);
  g.fillRect(1, 1, 1, s - 2);
  // Recessed rivets
  g.fillStyle(0x2a3040, 0.45);
  g.fillRect(3, 3, 2, 2);
  g.fillRect(s - 5, 3, 2, 2);
  g.fillRect(3, s - 5, 2, 2);
  g.fillRect(s - 5, s - 5, 2, 2);
  // Wear scratches
  g.fillStyle(0xffffff, 0.02);
  g.fillRect(7, 11, 9, 1);
  g.fillRect(14, 20, 6, 1);
  g.fillStyle(0x000000, 0.2);
  g.fillRect(18, 8, 5, 1);
  g.generateTexture(key, s, s);
  g.destroy();
}

function makeWallTile(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 32;
  g.fillStyle(0x0a0c12, 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(0x12161e, 1);
  g.fillRect(1, 1, 14, 14);
  g.fillRect(17, 1, 14, 14);
  g.fillRect(1, 17, 14, 14);
  g.fillRect(17, 17, 14, 14);
  g.fillStyle(0x1a2030, 1);
  g.fillRect(6, 6, 2, 2);
  g.fillRect(22, 22, 2, 2);
  g.generateTexture(TEXTURE_KEYS.wallTile, s, s);
  g.destroy();
}

function makeHazardStripe(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 24;
  // Dimmer caution tape — shadowed industrial yellow, not neon
  g.fillStyle(0x0a0b0e, 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(0x7a6410, 1);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      if (((x + y) % 10) < 5) g.fillRect(x, y, 1, 1);
    }
  }
  // Soft shadow edge so stripes sit into the wall lip
  g.fillStyle(0x000000, 0.35);
  g.fillRect(0, 0, s, 2);
  g.fillRect(0, s - 2, s, 2);
  g.generateTexture(TEXTURE_KEYS.hazardStripe, s, s);
  g.destroy();
}

function makeSawtooth(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(HAZARD_YELLOW, 1);
  for (let x = 0; x < 32; x += 8) {
    g.fillTriangle(x, 12, x + 4, 0, x + 8, 12);
  }
  g.generateTexture(TEXTURE_KEYS.sawtooth, 32, 12);
  g.destroy();
}

function makeBbLogo(scene: Phaser.Scene): void {
  // Clean centered official-style mark — flat, muted for floor paint
  const w = 360;
  const h = 150;
  const rt = scene.make.renderTexture({ width: w, height: h }, false);
  const g = gfx(scene);

  const bW = 96;
  const bH = 96;
  const gap = 4;
  const pairW = bW * 2 + gap;
  const startX = Math.round((w - pairW) / 2);
  const startY = 8;

  // Red faces right, cyan faces left — bowls meet in the middle
  drawCleanB(g, startX, startY, bW, bH, 0xc41e1e, 'right');
  drawCleanB(g, startX + bW + gap, startY, bW, bH, 0x1a8fc4, 'left');

  rt.draw(g, 0, 0);
  g.destroy();

  const label = scene.make.text({
    x: w / 2,
    y: 116,
    text: 'BATTLEBOTS',
    style: {
      fontFamily: HUD_FONT,
      fontSize: '18px',
      fontStyle: '700',
      color: '#d0d6e0',
    },
    add: false,
  });
  label.setOrigin(0.5, 0).setAlpha(0.8);
  rt.draw(label);
  label.destroy();

  rt.saveTexture(TEXTURE_KEYS.bbLogo);
  rt.destroy();
}

/** Flat blocky B — `face` is the direction the bowls open toward. */
function drawCleanB(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  face: 'left' | 'right',
): void {
  const stem = Math.round(w * 0.28);
  const barH = Math.round(h * 0.2);
  const holeW = Math.round(w * 0.38);
  const holeH = Math.round(h * 0.16);
  const outer = Math.round(w * 0.22);
  const bowlH = Math.round(h * 0.38);

  g.fillStyle(color, 0.75);

  if (face === 'right') {
    // Stem on left, bowls open right
    g.fillRect(x, y, stem, h);
    g.fillRect(x + stem - 1, y, w - stem, barH);
    g.fillRect(x + stem - 1, y + Math.round(h * 0.4), w - stem - 6, barH);
    g.fillRect(x + stem - 1, y + h - barH, w - stem, barH);
    g.fillRect(x + w - outer, y + Math.round(barH * 0.45), outer, bowlH);
    g.fillRect(x + w - outer, y + Math.round(h * 0.55), outer, bowlH);
    g.fillStyle(0x0a0c12, 1);
    const holeX = x + stem + Math.round(w * 0.06);
    g.fillRect(holeX, y + Math.round(h * 0.24), holeW, holeH);
    g.fillRect(holeX, y + Math.round(h * 0.62), holeW, holeH);
  } else {
    // Stem on right, bowls open left (mirror)
    g.fillRect(x + w - stem, y, stem, h);
    g.fillRect(x, y, w - stem + 1, barH);
    g.fillRect(x + 6, y + Math.round(h * 0.4), w - stem - 5, barH);
    g.fillRect(x, y + h - barH, w - stem + 1, barH);
    g.fillRect(x, y + Math.round(barH * 0.45), outer, bowlH);
    g.fillRect(x, y + Math.round(h * 0.55), outer, bowlH);
    g.fillStyle(0x0a0c12, 1);
    const holeX = x + w - stem - Math.round(w * 0.06) - holeW;
    g.fillRect(holeX, y + Math.round(h * 0.24), holeW, holeH);
    g.fillRect(holeX, y + Math.round(h * 0.62), holeW, holeH);
  }
}

function makeStartPad(scene: Phaser.Scene, key: string, color: number): void {
  const g = gfx(scene);
  const s = 100;
  g.fillStyle(color, 0.18);
  g.fillRect(0, 0, s, s);
  g.lineStyle(3, color, 0.95);
  g.strokeRect(3, 3, s - 6, s - 6);
  g.lineStyle(1, 0xffffff, 0.3);
  g.strokeRect(8, 8, s - 16, s - 16);
  g.generateTexture(key, s, s);
  g.destroy();
}

function makeHazardPad(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 44;
  const dimYellow = 0x9a7e18;
  g.lineStyle(3, dimYellow, 0.85);
  g.strokeRect(2, 2, s - 4, s - 4);
  g.lineStyle(1, dimYellow, 0.5);
  g.strokeRect(8, 8, s - 16, s - 16);
  g.fillStyle(dimYellow, 0.75);
  g.fillRect(s / 2 - 1, s / 2 - 1, 3, 3);
  g.generateTexture(TEXTURE_KEYS.hazardPad, s, s);
  g.destroy();
}

function makePulverizer(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // Metal housing + teeth + status lamp
  g.fillStyle(0x1a2030, 1);
  g.fillRect(0, 14, 56, 16);
  g.fillStyle(0x2a3040, 1);
  g.fillRect(2, 16, 52, 12);
  g.fillStyle(PLAYER_CYAN, 0.9);
  g.fillRect(26, 18, 4, 4);
  for (let x = 8; x <= 48; x += 9) {
    g.fillStyle(0x8a93a5, 1);
    g.fillTriangle(x, 16, x + 4, 2, x + 8, 16);
    g.fillStyle(0xd0d6e0, 1);
    g.fillTriangle(x + 1, 16, x + 4, 6, x + 5, 16);
  }
  g.generateTexture(TEXTURE_KEYS.pulverizer, 56, 32);
  g.destroy();
}

function makeCagePost(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0x2a3040, 1);
  g.fillRect(2, 0, 12, 20);
  g.fillStyle(0x6a7388, 1);
  g.fillRect(4, 1, 8, 18);
  g.fillStyle(0xc0c8d8, 1);
  g.fillRect(5, 2, 3, 5);
  g.generateTexture(TEXTURE_KEYS.cagePost, 16, 20);
  g.destroy();
}

function makeImpact(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(HAZARD_YELLOW, 0.7);
  g.fillCircle(14, 14, 12);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(14, 14, 5);
  g.generateTexture(TEXTURE_KEYS.impact, 28, 28);
  g.destroy();
}

function makeHudPanel(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0x141820, 0.92);
  g.fillRect(0, 0, 64, 32);
  g.lineStyle(2, PLAYER_CYAN, 1);
  g.strokeRect(1, 1, 62, 30);
  g.generateTexture(TEXTURE_KEYS.hudPanel, 64, 32);
  g.destroy();
}

function makeGlow(scene: Phaser.Scene, key: string, color: number): void {
  const g = gfx(scene);
  g.fillStyle(color, 0.06);
  g.fillCircle(32, 32, 30);
  g.fillStyle(color, 0.12);
  g.fillCircle(32, 32, 18);
  g.fillStyle(color, 0.2);
  g.fillCircle(32, 32, 10);
  g.generateTexture(key, 64, 64);
  g.destroy();
}

function makeSpark(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(HAZARD_YELLOW, 1);
  g.fillRect(3, 0, 2, 8);
  g.fillRect(0, 3, 8, 2);
  g.fillStyle(0xffffff, 1);
  g.fillRect(3, 3, 2, 2);
  g.generateTexture(TEXTURE_KEYS.spark, 8, 8);
  g.destroy();
}

function makeSmoke(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0x8a93a5, 0.5);
  g.fillCircle(6, 6, 5);
  g.fillStyle(0x5a6274, 0.35);
  g.fillCircle(8, 5, 3);
  g.generateTexture(TEXTURE_KEYS.smoke, 12, 12);
  g.destroy();
}

function makeWarnLight(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(HAZARD_YELLOW, 1);
  g.fillCircle(4, 4, 3);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(3, 3, 1);
  g.generateTexture(TEXTURE_KEYS.warnLight, 8, 8);
  g.destroy();
}

function makeNeonDot(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(PLAYER_CYAN, 0.8);
  g.fillRect(1, 1, 4, 4);
  g.fillStyle(0xffffff, 0.6);
  g.fillRect(2, 2, 1, 1);
  g.generateTexture(TEXTURE_KEYS.neonDot, 6, 6);
  g.destroy();
}

function makeHudIcons(scene: Phaser.Scene): void {
  // Black wedge + blue core (desired avatar)
  let g = gfx(scene);
  g.fillStyle(0x0a0c12, 1);
  g.fillTriangle(3, 5, 3, 27, 28, 16);
  g.fillStyle(0x1a80c0, 1);
  g.fillTriangle(10, 13, 10, 19, 20, 16);
  g.fillStyle(PLAYER_CYAN, 1);
  g.fillRect(12, 15, 6, 2);
  g.fillStyle(0xc8d0dc, 1);
  g.fillTriangle(20, 14, 29, 16, 20, 18);
  g.generateTexture(TEXTURE_KEYS.hudPlayer, 32, 32);
  g.destroy();

  g = gfx(scene);
  g.fillStyle(0x0a0c10, 1);
  g.fillRect(4, 6, 16, 20);
  g.fillStyle(ENEMY_ORANGE, 1);
  g.fillRect(6, 8, 12, 8);
  g.fillStyle(0xb0b8c4, 1);
  g.fillRect(18, 10, 10, 12);
  g.fillStyle(0xd0d6e0, 1);
  g.fillCircle(23, 16, 4);
  g.generateTexture(TEXTURE_KEYS.hudEnemy, 32, 32);
  g.destroy();
}

function makeLegendIcons(scene: Phaser.Scene): void {
  let g = gfx(scene);
  g.fillStyle(PLAYER_CYAN, 1);
  g.fillTriangle(1, 2, 1, 14, 14, 8);
  g.generateTexture(TEXTURE_KEYS.legendYou, 16, 16);
  g.destroy();

  g = gfx(scene);
  g.fillStyle(ENEMY_ORANGE, 1);
  g.fillTriangle(1, 2, 1, 14, 14, 8);
  g.generateTexture(TEXTURE_KEYS.legendEnemy, 16, 16);
  g.destroy();

  g = gfx(scene);
  g.lineStyle(2, HAZARD_YELLOW, 1);
  g.strokeRect(1, 1, 13, 13);
  g.generateTexture(TEXTURE_KEYS.legendHazard, 16, 16);
  g.destroy();

  g = gfx(scene);
  g.fillStyle(0x8a93a5, 1);
  g.fillTriangle(2, 12, 5, 2, 8, 12);
  g.fillTriangle(8, 12, 11, 2, 14, 12);
  g.generateTexture(TEXTURE_KEYS.legendSpike, 16, 16);
  g.destroy();
}

function makeWallFace(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // Raised wall lip — top catches light, bottom in shadow
  g.fillStyle(0x06080c, 1);
  g.fillRect(0, 0, 32, 6);
  g.fillStyle(0x181c26, 1);
  g.fillRect(0, 6, 32, 12);
  g.fillStyle(0x0c1016, 1);
  g.fillRect(0, 18, 32, 6);
  g.fillStyle(0x2a3040, 0.5);
  g.fillRect(0, 6, 32, 1);
  g.fillStyle(0x000000, 0.45);
  g.fillRect(0, 22, 32, 2);
  g.fillStyle(0x252a36, 1);
  g.fillRect(4, 10, 2, 2);
  g.fillRect(26, 10, 2, 2);
  g.generateTexture(TEXTURE_KEYS.wallFace, 32, 24);
  g.destroy();
}

function makeFloorLight(scene: Phaser.Scene, key: string, color: number): void {
  const g = gfx(scene);
  // Horizontal recessed floor strip (mockup)
  g.fillStyle(color, 0.2);
  g.fillRoundedRect(0, 0, 22, 8, 2);
  g.fillStyle(color, 0.95);
  g.fillRoundedRect(2, 2, 18, 4, 1);
  g.fillStyle(0xffffff, 0.55);
  g.fillRect(4, 3, 6, 2);
  g.generateTexture(key, 22, 8);
  g.destroy();
}

