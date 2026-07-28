import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Ribbot = SVG vectors (isometric portrait + top-down arena body). */
export function preloadRibbot(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.ribbotPortrait, '/robots/ribbot.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.ribbotBody, '/robots/ribbot-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudRibbot, '/robots/ribbot.svg', {
    width: 50,
    height: 35,
  });
}

export function generateRibbotTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.ribbotWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.ribbotWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x6a0810, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xd01818, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xc8d0dc, 1);
  g.fillTriangle(10, 5, 22, 8, 10, 11);
  g.generateTexture(TEXTURE_KEYS.ribbotWeapon, 28, 16);
  g.destroy();
}
