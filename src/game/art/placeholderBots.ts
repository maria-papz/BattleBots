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

export const PLACEHOLDER_BOTS: PlaceholderBotArt[] = [
  {
    id: 'tombstone',
    accent: 0x9a9aa8,
    secondary: 0x2a2a30,
    label: 'TOMBSTONE',
    bodyKey: 'tex-tombstone-body',
    weaponKey: 'tex-tombstone-weapon',
    portraitKey: 'tex-tombstone-portrait',
    hudKey: 'tex-hud-tombstone',
  },
  {
    id: 'terrortops',
    accent: 0xe04828,
    secondary: 0x3a2018,
    label: 'TERRORTOPS',
    bodyKey: 'tex-terrortops-body',
    weaponKey: 'tex-terrortops-weapon',
    portraitKey: 'tex-terrortops-portrait',
    hudKey: 'tex-hud-terrortops',
  },
  {
    id: 'skorpios',
    accent: 0xf07820,
    secondary: 0x3a2818,
    label: 'SKORPIOS',
    bodyKey: 'tex-skorpios-body',
    weaponKey: 'tex-skorpios-weapon',
    portraitKey: 'tex-skorpios-portrait',
    hudKey: 'tex-hud-skorpios',
  },
  {
    id: 'valkyrie',
    accent: 0xe040a8,
    secondary: 0x3a1830,
    label: 'VALKYRIE',
    bodyKey: 'tex-valkyrie-body',
    weaponKey: 'tex-valkyrie-weapon',
    portraitKey: 'tex-valkyrie-portrait',
    hudKey: 'tex-hud-valkyrie',
  },
  {
    id: 'switchback',
    accent: 0x40a848,
    secondary: 0x183820,
    label: 'SWITCHBACK',
    bodyKey: 'tex-switchback-body',
    weaponKey: 'tex-switchback-weapon',
    portraitKey: 'tex-switchback-portrait',
    hudKey: 'tex-hud-switchback',
  },
  {
    id: 'witchdoctor',
    accent: 0x8030c8,
    secondary: 0x281040,
    label: 'W.DOC',
    bodyKey: 'tex-witchdoctor-body',
    weaponKey: 'tex-witchdoctor-weapon',
    portraitKey: 'tex-witchdoctor-portrait',
    hudKey: 'tex-hud-witchdoctor',
  },
  {
    id: 'thetwins',
    accent: 0xe8c020,
    secondary: 0x403818,
    label: 'TWINS',
    bodyKey: 'tex-thetwins-body',
    weaponKey: 'tex-thetwins-weapon',
    portraitKey: 'tex-thetwins-portrait',
    hudKey: 'tex-hud-thetwins',
  },
];

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
