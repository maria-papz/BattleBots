import Phaser from 'phaser';
import { COBALT_GREEN, TEXTURE_KEYS } from '../constants';

const BLACK = 0x0a0a0c;
const CHARCOAL = 0x141418;
const PLATE = 0x1a1a20;
const PLATE_HI = 0x2e2e36;
const EDGE = 0x4a4a55;
const STEEL = 0xa8b0bc;
const STEEL_DARK = 0x5a6270;
const GREEN = COBALT_GREEN;
const GREEN_DARK = 0x1a4a32;
const GREEN_LIT = 0x3d9a68;
const HOLO = [0xff5ca8, 0xc45cff, 0x5ce1ff, 0x5cff9a, 0xffe05c] as const;

type Pt = { x: number; y: number };

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 });
}

function bolt(g: Phaser.GameObjects.Graphics, x: number, y: number, r = 1.6): void {
  g.fillStyle(STEEL, 1);
  g.fillCircle(x, y, r);
  g.fillStyle(STEEL_DARK, 1);
  g.fillCircle(x - 0.4, y - 0.4, r * 0.35);
}

/** Vertical disc with forest-green jagged teeth. */
function drawVertDisc(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  radius: number,
  teeth: number,
  facingRight = true,
): void {
  // Disc body (ellipse for slight perspective)
  const rx = radius * (facingRight ? 0.42 : 0.55);
  const ry = radius;

  g.fillStyle(CHARCOAL, 1);
  g.fillEllipse(cx, cy, rx * 2.1, ry * 2.1);
  g.fillStyle(0x222228, 1);
  g.fillEllipse(cx, cy, rx * 1.7, ry * 1.7);

  // Green teeth around rim
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2 - Math.PI / 2;
    const inset = 0.72;
    const outer = 1.05;
    const mid = a + Math.PI / teeth;
    const p0 = {
      x: cx + Math.cos(a) * rx * inset,
      y: cy + Math.sin(a) * ry * inset,
    };
    const tip = {
      x: cx + Math.cos(mid) * rx * outer,
      y: cy + Math.sin(mid) * ry * outer,
    };
    const p1 = {
      x: cx + Math.cos(a + (Math.PI * 2) / teeth) * rx * inset,
      y: cy + Math.sin(a + (Math.PI * 2) / teeth) * ry * inset,
    };
    g.fillStyle(i % 2 === 0 ? GREEN : GREEN_DARK, 1);
    g.fillTriangle(p0.x, p0.y, tip.x, tip.y, p1.x, p1.y);
    g.fillStyle(GREEN_LIT, 0.55);
    g.fillCircle(tip.x, tip.y, Math.max(1, radius * 0.04));
  }

  // Hub
  g.fillStyle(STEEL_DARK, 1);
  g.fillEllipse(cx, cy, rx * 0.7, ry * 0.55);
  g.fillStyle(STEEL, 1);
  g.fillEllipse(cx, cy, rx * 0.4, ry * 0.32);
  g.fillStyle(0x3a80c0, 1);
  g.fillEllipse(cx, cy, rx * 0.18, ry * 0.14);
}

function drawFork(
  g: Phaser.GameObjects.Graphics,
  base: Pt,
  tip: Pt,
  width: number,
): void {
  const ang = Math.atan2(tip.y - base.y, tip.x - base.x);
  const perp = ang + Math.PI / 2;
  const poly = [
    {
      x: base.x + Math.cos(perp) * width,
      y: base.y + Math.sin(perp) * width,
    },
    {
      x: tip.x + Math.cos(perp) * width * 0.35,
      y: tip.y + Math.sin(perp) * width * 0.35,
    },
    {
      x: tip.x - Math.cos(perp) * width * 0.35,
      y: tip.y - Math.sin(perp) * width * 0.35,
    },
    {
      x: base.x - Math.cos(perp) * width,
      y: base.y - Math.sin(perp) * width,
    },
  ];
  g.fillStyle(GREEN_DARK, 1);
  g.fillPoints(poly, true);
  g.fillStyle(GREEN, 1);
  g.fillTriangle(
    poly[0]!.x,
    poly[0]!.y,
    tip.x,
    tip.y,
    (poly[0]!.x + poly[3]!.x) / 2,
    (poly[0]!.y + poly[3]!.y) / 2,
  );
  g.lineStyle(1, GREEN_LIT, 0.5);
  g.strokePoints(poly, true);
}

function holoBar(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const band = w / HOLO.length;
  HOLO.forEach((c, i) => {
    g.fillStyle(c, 0.95);
    g.fillRect(x + i * band, y, band + 0.5, h);
  });
}

/**
 * Arena body — top-down Cobalt, faces +X.
 * Black wedge, green forks forward, vertical disc near rear.
 */
export function makeCobaltBody(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 80;
  const cx = s / 2;
  const cy = s / 2;

  g.fillStyle(GREEN, 0.1);
  g.fillEllipse(cx, cy + 20, 44, 11);
  g.fillStyle(0x000000, 0.4);
  g.fillEllipse(cx, cy + 18, 36, 8);

  // Wedge chassis (point toward +X)
  g.fillStyle(BLACK, 1);
  g.fillTriangle(cx - 18, cy - 16, cx - 18, cy + 16, cx + 20, cy);
  g.fillStyle(PLATE, 1);
  g.fillTriangle(cx - 15, cy - 12, cx - 15, cy + 12, cx + 14, cy);
  g.fillStyle(PLATE_HI, 1);
  g.fillTriangle(cx - 10, cy - 6, cx - 10, cy + 6, cx + 6, cy);

  // Edge highlight
  g.lineStyle(1, EDGE, 0.7);
  g.strokeTriangle(cx - 18, cy - 16, cx - 18, cy + 16, cx + 20, cy);

  bolt(g, cx - 8, cy - 7);
  bolt(g, cx - 8, cy + 7);
  bolt(g, cx + 2, cy);

  // Holo name streak on deck
  holoBar(g, cx - 12, cy - 2, 14, 3);

  // Green forks
  drawFork(g, { x: cx + 12, y: cy - 6 }, { x: cx + 34, y: cy - 8 }, 2.4);
  drawFork(g, { x: cx + 12, y: cy + 6 }, { x: cx + 34, y: cy + 8 }, 2.4);

  // Vert disc mount near rear-center (seen as ellipse from top)
  g.fillStyle(BLACK, 1);
  g.fillRect(cx - 16, cy - 4, 8, 8);
  drawVertDisc(g, cx - 10, cy, 11, 12, true);

  g.generateTexture(TEXTURE_KEYS.cobaltBody, s, s);
  g.destroy();
}

export function makeCobaltWeapon(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(GREEN, 0.95);
  g.fillTriangle(0, 4, 26, 8, 0, 12);
  g.fillStyle(GREEN_LIT, 0.85);
  g.fillTriangle(4, 6, 18, 8, 4, 10);
  g.fillStyle(0xffffff, 0.35);
  g.fillTriangle(2, 7, 8, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.cobaltWeapon, 28, 16);
  g.destroy();
}

export function makeCobaltHud(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(PLATE, 1);
  g.fillTriangle(4, 6, 4, 26, 26, 16);
  g.fillStyle(GREEN, 1);
  g.fillTriangle(20, 12, 30, 14, 20, 18);
  g.fillTriangle(20, 16, 30, 18, 20, 20);
  drawVertDisc(g, 12, 16, 7, 8, true);
  holoBar(g, 6, 14, 8, 2);
  g.generateTexture(TEXTURE_KEYS.hudCobalt, 32, 32);
  g.destroy();
}

/**
 * Select portrait — three-quarter Cobalt matching the reference.
 */
export function makeCobaltPortrait(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 176;
  const cx = 88;
  const cy = 108;

  g.fillStyle(GREEN, 0.12);
  g.fillCircle(cx, cy - 16, 68);
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(cx, cy + 34, 76, 14);

  // Main black wedge body (iso)
  // Top deck
  g.fillStyle(PLATE, 1);
  const top: Pt[] = [
    { x: cx - 48, y: cy - 8 },
    { x: cx + 8, y: cy - 28 },
    { x: cx + 52, y: cy - 4 },
    { x: cx + 18, y: cy + 22 },
    { x: cx - 36, y: cy + 18 },
  ];
  g.fillPoints(top, true);

  // Front-left face
  g.fillStyle(CHARCOAL, 1);
  g.fillPoints(
    [
      { x: cx - 48, y: cy - 8 },
      { x: cx - 36, y: cy + 18 },
      { x: cx - 36, y: cy + 34 },
      { x: cx - 50, y: cy + 8 },
    ],
    true,
  );

  // Front face (toward viewer-right)
  g.fillStyle(BLACK, 1);
  g.fillPoints(
    [
      { x: cx - 36, y: cy + 18 },
      { x: cx + 18, y: cy + 22 },
      { x: cx + 18, y: cy + 38 },
      { x: cx - 36, y: cy + 34 },
    ],
    true,
  );

  // Right/side slope
  g.fillStyle(0x121218, 1);
  g.fillPoints(
    [
      { x: cx + 18, y: cy + 22 },
      { x: cx + 52, y: cy - 4 },
      { x: cx + 52, y: cy + 12 },
      { x: cx + 18, y: cy + 38 },
    ],
    true,
  );

  // Edge lines
  g.lineStyle(1.5, EDGE, 0.75);
  g.strokePoints(top, true);

  // Bolts along seams
  for (const [bx, by] of [
    [cx - 30, cy + 6],
    [cx - 12, cy + 12],
    [cx + 4, cy + 14],
    [cx + 28, cy + 6],
    [cx - 40, cy + 2],
    [cx + 40, cy - 2],
  ] as const) {
    bolt(g, bx, by, 2);
  }

  // Iridescent COBALT lettering (front-left plate)
  holoBar(g, cx - 42, cy + 2, 36, 7);
  g.fillStyle(0x0a0a0c, 0.35);
  for (let i = 0; i < 4; i++) {
    g.fillRect(cx - 42, cy + 2 + i * 2, 36, 1);
  }

  // HA / Hobby Action mark
  holoBar(g, cx - 20, cy - 12, 18, 5);
  g.fillStyle(HOLO[0], 0.9);
  g.fillRoundedRect(cx + 2, cy - 16, 14, 12, 2);
  g.fillStyle(0xffffff, 0.85);
  g.fillRect(cx + 5, cy - 12, 8, 2);
  g.fillRect(cx + 5, cy - 8, 8, 2);

  // MOD HOBBIES side stack (colored blocks)
  for (let i = 0; i < 5; i++) {
    g.fillStyle(HOLO[i % HOLO.length]!, 0.9);
    g.fillRect(cx + 38, cy - 6 + i * 5, 10, 3.5);
  }

  // PC GARAGE cyan sticker
  g.fillStyle(0x3ad0e8, 1);
  g.fillRoundedRect(cx + 6, cy - 2, 22, 7, 1);
  g.fillStyle(0x0a2030, 1);
  g.fillRect(cx + 8, cy, 18, 2);

  // Green forks extending forward-right
  drawFork(g, { x: cx + 20, y: cy + 28 }, { x: cx + 68, y: cy + 42 }, 3.2);
  drawFork(g, { x: cx + 8, y: cy + 32 }, { x: cx + 58, y: cy + 52 }, 3.2);

  // Weapon brackets
  g.fillStyle(BLACK, 1);
  g.fillTriangle(cx - 6, cy - 20, cx + 10, cy - 36, cx + 14, cy - 8);
  g.fillTriangle(cx + 8, cy - 18, cx + 26, cy - 34, cx + 22, cy - 6);
  g.fillStyle(PLATE_HI, 1);
  g.fillRect(cx + 2, cy - 28, 10, 18);

  // Vertical spinner disc
  drawVertDisc(g, cx + 10, cy - 30, 34, 16, true);

  // Small green ear/guard
  g.fillStyle(GREEN, 1);
  g.fillTriangle(cx - 4, cy - 34, cx + 4, cy - 42, cx + 2, cy - 28);

  g.generateTexture(TEXTURE_KEYS.cobaltPortrait, s, s);
  g.destroy();
}

export function generateCobaltTextures(scene: Phaser.Scene): void {
  makeCobaltBody(scene);
  makeCobaltWeapon(scene);
  makeCobaltHud(scene);
  makeCobaltPortrait(scene);
}
