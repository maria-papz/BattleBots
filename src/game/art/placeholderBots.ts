import Phaser from 'phaser';
import { HUD_FONT } from '../constants';

export interface PlaceholderBotArt {
  id: string;
  accent: number;
  secondary: number;
  label: string;
  bodyKey: string;
  weaponKey: string;
  portraitKey: string;
  hudKey: string;
}

export const PLACEHOLDER_BOTS: PlaceholderBotArt[] = [];

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 });
}

function bake(g: Phaser.GameObjects.Graphics, key: string, w: number, h: number) {
  g.generateTexture(key, w, h);
  g.destroy();
}

function drawBody(g: Phaser.GameObjects.Graphics, accent: number, secondary: number) {
  g.fillStyle(secondary, 1);
  g.fillRoundedRect(4, 8, 40, 32, 6);
  g.fillStyle(accent, 1);
  g.fillRoundedRect(8, 4, 32, 12, 4);
  g.fillStyle(0xd0d6e0, 0.9);
  g.fillCircle(16, 22, 4);
  g.fillCircle(28, 22, 4);
  g.lineStyle(2, accent, 0.8);
  g.strokeRoundedRect(4, 8, 40, 32, 6);
}

function drawWeapon(g: Phaser.GameObjects.Graphics, accent: number) {
  g.fillStyle(accent, 1);
  g.fillCircle(24, 24, 18);
  g.fillStyle(0xffffff, 0.35);
  g.fillRect(6, 22, 36, 4);
  g.lineStyle(2, 0xffffff, 0.5);
  g.strokeCircle(24, 24, 18);
}

function drawPortrait(scene: Phaser.Scene, bot: PlaceholderBotArt) {
  const g = gfx(scene);
  const w = 200;
  const h = 160;
  g.fillStyle(0x0e121a, 1);
  g.fillRoundedRect(0, 0, w, h, 10);
  g.fillStyle(bot.accent, 0.25);
  g.fillCircle(w / 2, h / 2 - 10, 60);
  drawBody(g, bot.accent, bot.secondary);
  g.setPosition(w / 2 - 24, h / 2 - 20);
  const label = scene.add
    .text(w / 2, h - 24, bot.label, {
      fontFamily: HUD_FONT,
      fontSize: '14px',
      fontStyle: '700',
      color: `#${bot.accent.toString(16).padStart(6, '0')}`,
    })
    .setOrigin(0.5);
  const rt = scene.make.renderTexture({ x: 0, y: 0, width: w, height: h }, false);
  rt.draw(g);
  rt.draw(label);
  rt.saveTexture(bot.portraitKey);
  rt.destroy();
  label.destroy();
  g.destroy();
}

function drawHud(scene: Phaser.Scene, bot: PlaceholderBotArt) {
  const g = gfx(scene);
  drawBody(g, bot.accent, bot.secondary);
  bake(g, bot.hudKey, 48, 48);
}

export function generatePlaceholderBotTextures(scene: Phaser.Scene): void {
  for (const bot of PLACEHOLDER_BOTS) {
    const body = gfx(scene);
    drawBody(body, bot.accent, bot.secondary);
    bake(body, bot.bodyKey, 48, 48);

    const weapon = gfx(scene);
    drawWeapon(weapon, bot.accent);
    bake(weapon, bot.weaponKey, 48, 48);

    drawHud(scene, bot);
    drawPortrait(scene, bot);
  }
}

export function getPlaceholderBot(id: string): PlaceholderBotArt | undefined {
  return PLACEHOLDER_BOTS.find((b) => b.id === id);
}
