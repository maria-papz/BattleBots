import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Disarray = SVG vectors (isometric portrait + top-down arena body). */
export function preloadDisarray(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.disarrayPortrait, '/robots/disarray.svg', {
    width: 300,
    height: 222,
  });
  scene.load.svg(TEXTURE_KEYS.disarrayBody, '/robots/disarray-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudDisarray, '/robots/disarray.svg', {
    width: 48,
    height: 35,
  });
}

export function generateDisarrayTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.disarrayWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.disarrayWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xa8b0bc, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xffffff, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xe87820, 0.55);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.disarrayWeapon, 28, 16);
  g.destroy();
}
