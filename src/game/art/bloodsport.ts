import Phaser from 'phaser';
import { BLOODSPORT_RED, TEXTURE_KEYS } from '../constants';

/** Palette matched to the Bloodsport reference. */
const WHITE = 0xf2f2f2;
const WHITE_MID = 0xd8d8d8;
const WHITE_SHADE = 0xa8a8a8;
const BLACK = 0x0c0c0c;
const BLADE = 0x141414;
const BLADE_EDGE = 0x2a2a2a;
const GREY = 0x555555;
const BLOOD = BLOODSPORT_RED;
const BLOOD_BRIGHT = 0xe02440;
const BLOOD_DARK = 0x8a1428;

type Pt = { x: number; y: number };

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 });
}

/** Jagged blood blot — irregular polygon clusters. */
function splat(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  scale: number,
  color = BLOOD,
): void {
  g.fillStyle(color, 1);
  const blobs: Array<[number, number, number]> = [
    [0, 0, 1],
    [0.55, -0.35, 0.55],
    [-0.45, 0.4, 0.5],
    [0.7, 0.35, 0.35],
    [-0.65, -0.25, 0.32],
    [0.15, 0.7, 0.28],
    [-0.2, -0.65, 0.25],
    [0.95, 0.05, 0.18],
    [-0.9, 0.15, 0.16],
  ];
  for (const [ox, oy, r] of blobs) {
    g.fillCircle(x + ox * scale * 5, y + oy * scale * 5, r * scale * 4.2);
  }
  // Drips
  g.fillEllipse(x + scale * 2, y + scale * 5, scale * 2.2, scale * 5);
  g.fillCircle(x + scale * 2.2, y + scale * 8, scale * 1.1);
}

function heavyTipBlood(
  g: Phaser.GameObjects.Graphics,
  tipX: number,
  tipY: number,
  ang: number,
  scale: number,
): void {
  const bx = tipX - Math.cos(ang) * scale * 3;
  const by = tipY - Math.sin(ang) * scale * 3;
  splat(g, bx, by, scale * 1.35, BLOOD_BRIGHT);
  splat(g, tipX, tipY, scale * 1.1, BLOOD);
  splat(g, tipX - Math.cos(ang) * scale * 6, tipY - Math.sin(ang) * scale * 6, scale * 0.7, BLOOD_DARK);
}

/**
 * Curved scythe/boomerang blade like the reference —
 * wide at hub, bends, tapers to a rounded tip.
 */
function bladePolygon(
  cx: number,
  cy: number,
  length: number,
  halfW: number,
  ang: number,
  squashY = 1,
): Pt[] {
  // Local blade along +X, then rotate + optional Y squash for isometric
  const local: Pt[] = [
    { x: length * 0.08, y: -halfW * 0.55 },
    { x: length * 0.28, y: -halfW * 1.05 },
    { x: length * 0.52, y: -halfW * 0.95 },
    { x: length * 0.78, y: -halfW * 0.55 },
    { x: length * 0.96, y: -halfW * 0.18 },
    { x: length, y: 0 },
    { x: length * 0.96, y: halfW * 0.22 },
    { x: length * 0.72, y: halfW * 0.7 },
    { x: length * 0.42, y: halfW * 0.85 },
    { x: length * 0.18, y: halfW * 0.5 },
    { x: length * 0.06, y: halfW * 0.2 },
  ];
  return local.map((p) => {
    const rx = p.x * Math.cos(ang) - p.y * Math.sin(ang);
    const ry = p.x * Math.sin(ang) + p.y * Math.cos(ang);
    return { x: cx + rx, y: cy + ry * squashY };
  });
}

function drawSpinner(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  length: number,
  halfW: number,
  startDeg: number,
  squashY = 1,
  withLogo = false,
): void {
  for (let i = 0; i < 3; i++) {
    const ang = Phaser.Math.DegToRad(startDeg + i * 120);
    const poly = bladePolygon(cx, cy, length, halfW, ang, squashY);

    g.fillStyle(BLADE, 1);
    g.fillPoints(poly, true);
    g.lineStyle(1, BLADE_EDGE, 0.9);
    g.strokePoints(poly, true);

    const tip = poly[5]!;
    heavyTipBlood(g, tip.x, tip.y, ang, length / 28);

    // Mid-blade streak
    splat(
      g,
      cx + Math.cos(ang) * length * 0.62,
      cy + Math.sin(ang) * length * 0.62 * squashY,
      length / 40,
      BLOOD_DARK,
    );

    if (withLogo && i === 0) {
      // PROTOLABS mark on blade
      const lx = cx + Math.cos(ang) * length * 0.38;
      const ly = cy + Math.sin(ang) * length * 0.38 * squashY;
      g.fillStyle(0xffffff, 0.92);
      g.fillRect(lx - 9, ly - 2, 18, 3);
      g.fillCircle(lx - 11, ly, 2.2);
    }
  }

  // Hub: black disc + red bolt ring (matches reference)
  const hubR = length * 0.22;
  g.fillStyle(BLACK, 1);
  g.fillCircle(cx, cy, hubR);
  g.fillStyle(BLADE_EDGE, 1);
  g.fillCircle(cx, cy, hubR * 0.72);
  g.fillStyle(BLACK, 1);
  g.fillCircle(cx, cy, hubR * 0.38);

  // Red bolt ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const bx = cx + Math.cos(a) * hubR * 0.58;
    const by = cy + Math.sin(a) * hubR * 0.58 * squashY;
    g.fillStyle(BLOOD, 1);
    g.fillCircle(bx, by, Math.max(1.4, hubR * 0.12));
    g.fillStyle(BLOOD_BRIGHT, 1);
    g.fillCircle(bx - 0.4, by - 0.4, Math.max(0.6, hubR * 0.05));
  }
}

function drawMast(
  g: Phaser.GameObjects.Graphics,
  baseX: number,
  baseY: number,
  scale: number,
): void {
  // Thick white S-curve pole (self-righting) — scorpion-tail silhouette
  const pts: Pt[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Rise up, curve back, tip forward-up
    const x = baseX - Math.sin(t * Math.PI) * scale * 4 + t * scale * 2;
    const y = baseY - t * scale * 22 - Math.sin(t * Math.PI * 0.85) * scale * 2;
    pts.push({ x, y });
  }

  // Shadow edge
  const p0 = pts[0]!;
  g.lineStyle(scale * 3.2, WHITE_SHADE, 1);
  g.beginPath();
  g.moveTo(p0.x + 1.2, p0.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!;
    g.lineTo(p.x + 1.2, p.y);
  }
  g.strokePath();

  g.lineStyle(scale * 2.6, WHITE, 1);
  g.beginPath();
  g.moveTo(p0.x, p0.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!;
    g.lineTo(p.x, p.y);
  }
  g.strokePath();

  // Highlight
  g.lineStyle(scale * 0.9, 0xffffff, 0.55);
  g.beginPath();
  g.moveTo(p0.x - 1, p0.y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!;
    g.lineTo(p.x - 1, p.y);
  }
  g.strokePath();

  const s1 = pts[6]!;
  const s2 = pts[11]!;
  const s3 = pts[15]!;
  splat(g, s1.x, s1.y, scale * 0.55);
  splat(g, s2.x + 1, s2.y, scale * 0.45);
  splat(g, s3.x, s3.y, scale * 0.35);
}

function drawForks(
  g: Phaser.GameObjects.Graphics,
  hinge1: Pt,
  hinge2: Pt,
  tip1: Pt,
  tip2: Pt,
  scale: number,
): void {
  // Hinge blocks
  g.fillStyle(BLACK, 1);
  g.fillRoundedRect(hinge1.x - scale * 3, hinge1.y - scale * 3, scale * 7, scale * 6, 2);
  g.fillRoundedRect(hinge2.x - scale * 3, hinge2.y - scale * 3, scale * 7, scale * 6, 2);
  g.fillStyle(GREY, 1);
  g.fillCircle(hinge1.x, hinge1.y, scale * 1.6);
  g.fillCircle(hinge2.x, hinge2.y, scale * 1.6);

  // Wedge plates (trapezoids)
  const fork = (h: Pt, tip: Pt, spread: number) => {
    const ang = Math.atan2(tip.y - h.y, tip.x - h.x);
    const perp = ang + Math.PI / 2;
    const w0 = scale * 3.2;
    const w1 = scale * 2.2;
    const poly = [
      { x: h.x + Math.cos(perp) * w0, y: h.y + Math.sin(perp) * w0 },
      { x: tip.x + Math.cos(perp) * w1, y: tip.y + Math.sin(perp) * w1 },
      { x: tip.x - Math.cos(perp) * w1, y: tip.y - Math.sin(perp) * w1 },
      { x: h.x - Math.cos(perp) * w0, y: h.y - Math.sin(perp) * w0 },
    ];
    g.fillStyle(BLACK, 1);
    g.fillPoints(poly, true);
    g.lineStyle(1, BLADE_EDGE, 0.8);
    g.strokePoints(poly, true);
    heavyTipBlood(g, tip.x, tip.y, ang, scale * 0.9);
    splat(g, tip.x - Math.cos(ang) * scale * 4, tip.y - Math.sin(ang) * scale * 4, scale * 0.7);
    void spread;
  };

  fork(hinge1, tip1, 1);
  fork(hinge2, tip2, 1);
}

function drawChassisIso(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
): void {
  // Top face
  g.fillStyle(WHITE, 1);
  g.fillRoundedRect(cx - w / 2, cy - d / 2, w, d, 7);

  // Front/side thickness
  g.fillStyle(WHITE_SHADE, 1);
  g.fillRoundedRect(cx - w / 2, cy + d / 2 - 4, w, h, 4);
  g.fillStyle(WHITE_MID, 1);
  g.fillRect(cx - w / 2 + 2, cy + d / 2 - 2, w - 4, h - 4);

  // Side perforations
  g.fillStyle(GREY, 0.85);
  for (let i = 0; i < 6; i++) {
    g.fillCircle(cx - w / 2 + 8 + i * ((w - 16) / 5), cy + d / 2 + h * 0.35, 1.3);
  }

  // Top rivets / bolt ring near edges
  g.fillStyle(GREY, 1);
  for (let i = 0; i < 4; i++) {
    g.fillCircle(cx - w / 2 + 10 + i * ((w - 20) / 3), cy - d / 2 + 7, 1.5);
    g.fillCircle(cx - w / 2 + 10 + i * ((w - 20) / 3), cy + d / 2 - 8, 1.5);
  }

  // Red circular logo (left)
  g.fillStyle(BLOOD, 1);
  g.fillCircle(cx - w * 0.28, cy - 2, 7);
  g.fillStyle(WHITE, 1);
  g.fillCircle(cx - w * 0.28, cy - 2, 3.5);
  g.fillStyle(BLOOD, 1);
  g.fillRect(cx - w * 0.28 - 1.5, cy - 6, 3, 8);

  // Chassis blood field
  splat(g, cx - w * 0.15, cy - 4, 1.5);
  splat(g, cx + w * 0.05, cy + 6, 1.2);
  splat(g, cx + w * 0.22, cy - 2, 1.0);
  splat(g, cx - w * 0.05, cy + 10, 0.85);
  splat(g, cx + w * 0.3, cy + 8, 0.7, BLOOD_DARK);
}

/**
 * Arena body — top-down, faces +X. Large spinner, white deck, forks forward.
 */
export function makeBloodsportBody(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 80;
  const cx = s / 2;
  const cy = s / 2;

  g.fillStyle(BLOOD, 0.12);
  g.fillEllipse(cx, cy + 22, 48, 12);
  g.fillStyle(0x000000, 0.4);
  g.fillEllipse(cx, cy + 20, 40, 9);

  // Chassis
  g.fillStyle(WHITE_SHADE, 1);
  g.fillRoundedRect(cx - 17, cy - 15, 34, 30, 5);
  g.fillStyle(WHITE, 1);
  g.fillRoundedRect(cx - 15, cy - 13, 30, 26, 4);

  g.fillStyle(BLOOD, 1);
  g.fillCircle(cx - 8, cy - 2, 3.2);
  g.fillStyle(WHITE, 1);
  g.fillCircle(cx - 8, cy - 2, 1.4);

  splat(g, cx - 4, cy + 4, 0.85);
  splat(g, cx + 6, cy - 4, 0.65);
  splat(g, cx + 2, cy + 8, 0.5);

  // Forks toward +X
  drawForks(
    g,
    { x: cx + 12, y: cy - 7 },
    { x: cx + 12, y: cy + 7 },
    { x: cx + 30, y: cy - 8 },
    { x: cx + 30, y: cy + 8 },
    1.05,
  );

  drawSpinner(g, cx, cy, 24, 5.2, -25, 1, false);

  // Short mast tip (top-down)
  g.lineStyle(3.2, WHITE_SHADE, 1);
  g.lineBetween(cx, cy - 2, cx - 2, cy - 16);
  g.lineStyle(2.4, WHITE, 1);
  g.lineBetween(cx, cy - 2, cx - 1, cy - 15);
  splat(g, cx - 1, cy - 10, 0.4);

  g.generateTexture(TEXTURE_KEYS.bloodsportBody, s, s);
  g.destroy();
}

export function makeBloodsportWeapon(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(BLADE, 1);
  g.fillTriangle(0, 3, 26, 8, 0, 13);
  g.fillStyle(BLOOD_BRIGHT, 0.95);
  g.fillTriangle(14, 5, 26, 8, 14, 11);
  splat(g, 22, 8, 0.7);
  g.fillStyle(0xffffff, 0.4);
  g.fillTriangle(2, 6, 10, 8, 2, 10);
  g.generateTexture(TEXTURE_KEYS.bloodsportWeapon, 28, 16);
  g.destroy();
}

export function makeBloodsportHud(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(WHITE, 1);
  g.fillRoundedRect(5, 9, 20, 15, 2);
  drawSpinner(g, 16, 16, 12, 2.6, -20, 1, false);
  splat(g, 9, 12, 0.4);
  g.generateTexture(TEXTURE_KEYS.hudBloodsport, 32, 32);
  g.destroy();
}

/**
 * Select portrait — isometric three-quarter matching the reference silhouette.
 */
export function makeBloodsportPortrait(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 176;
  const cx = 88;
  const bodyY = 108;

  // Soft red halo
  g.fillStyle(BLOOD, 0.16);
  g.fillCircle(cx, bodyY - 20, 70);
  g.fillStyle(BLOOD, 0.07);
  g.fillCircle(cx, bodyY - 20, 92);
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(cx, bodyY + 36, 78, 16);

  // Chassis first (under spinner)
  drawChassisIso(g, cx, bodyY, 92, 40, 14);

  // Front forks — lower right, angled down
  drawForks(
    g,
    { x: cx + 22, y: bodyY + 8 },
    { x: cx + 14, y: bodyY + 16 },
    { x: cx + 58, y: bodyY + 24 },
    { x: cx + 52, y: bodyY + 36 },
    1.35,
  );

  // Spinner sits atop chassis — slight perspective squash
  const hubX = cx;
  const hubY = bodyY - 14;
  drawSpinner(g, hubX, hubY, 54, 9.5, -42, 0.78, true);

  // Mast from hub center, curves up (scorpion tail)
  drawMast(g, hubX, hubY - 6, 1.55);

  // Extra blood accents on deck under spinner gap
  splat(g, cx - 28, bodyY + 4, 1.1);
  splat(g, cx + 8, bodyY + 12, 0.9);

  g.generateTexture(TEXTURE_KEYS.bloodsportPortrait, s, s);
  g.destroy();
}

export function generateBloodsportTextures(scene: Phaser.Scene): void {
  makeBloodsportBody(scene);
  makeBloodsportWeapon(scene);
  makeBloodsportHud(scene);
  makeBloodsportPortrait(scene);
}
