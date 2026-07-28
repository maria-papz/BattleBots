import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Malice = SVG vectors (isometric portrait + top-down arena body). */
export function preloadMalice(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.malicePortrait, '/robots/malice.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.maliceBody, '/robots/malice-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudMalice, '/robots/malice.svg', {
    width: 50,
    height: 35,
  });
}

export function generateMaliceTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.maliceWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.maliceWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x7a0810, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xd01818, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0x9aa0aa, 1);
  g.fillTriangle(16, 5, 28, 8, 16, 11);
  g.generateTexture(TEXTURE_KEYS.maliceWeapon, 28, 16);
  g.destroy();
}
