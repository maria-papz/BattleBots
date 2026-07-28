import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Death Roll = SVG vectors (isometric portrait + top-down arena body). */
export function preloadDeathRoll(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.deathrollPortrait, '/robots/deathroll.svg', {
    width: 300,
    height: 205,
  });
  scene.load.svg(TEXTURE_KEYS.deathrollBody, '/robots/deathroll-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudDeathroll, '/robots/deathroll.svg', {
    width: 48,
    height: 33,
  });
}

export function generateDeathRollTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.deathrollWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.deathrollWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x8a0c18, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xff4d5c, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xffe0e4, 0.45);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.deathrollWeapon, 28, 16);
  g.destroy();
}
