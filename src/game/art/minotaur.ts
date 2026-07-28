import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Minotaur = SVG vectors (isometric portrait + top-down arena body). */
export function preloadMinotaur(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.minotaurPortrait, '/robots/minotaur.svg', {
    width: 300,
    height: 209,
  });
  scene.load.svg(TEXTURE_KEYS.minotaurBody, '/robots/minotaur-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudMinotaur, '/robots/minotaur.svg', {
    width: 50,
    height: 35,
  });
}

export function generateMinotaurTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.minotaurWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.minotaurWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x6a4810, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xc89830, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xf0d060, 0.5);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.minotaurWeapon, 28, 16);
  g.destroy();
}
