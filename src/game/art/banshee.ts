import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Banshee = SVG vectors (isometric portrait + top-down arena body). */
export function preloadBanshee(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.bansheePortrait, '/robots/banshee.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.bansheeBody, '/robots/banshee-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudBanshee, '/robots/banshee.svg', {
    width: 48,
    height: 34,
  });
}

export function generateBansheeTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.bansheeWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.bansheeWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x121218, 1);
  g.fillTriangle(0, 12, 24, 2, 24, 20);
  g.fillStyle(0xb8ff2a, 1);
  g.fillCircle(18, 8, 5);
  g.fillStyle(0x0a0a0e, 1);
  g.fillCircle(17, 8, 1.5);
  g.fillCircle(19, 8, 1.5);
  g.fillStyle(0x68a818, 1);
  g.fillTriangle(4, 14, 20, 8, 20, 16);
  g.lineStyle(1, 0x0a0a0e, 0.9);
  g.strokeTriangle(0, 12, 24, 2, 24, 20);
  g.generateTexture(TEXTURE_KEYS.bansheeWeapon, 28, 22);
  g.destroy();
}
