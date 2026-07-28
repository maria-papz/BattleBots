import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** HUGE = SVG vectors (isometric portrait + top-down arena body). */
export function preloadHuge(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.hugePortrait, '/robots/huge.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.hugeBody, '/robots/huge-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudHuge, '/robots/huge.svg', {
    width: 48,
    height: 34,
  });
}

export function generateHugeTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.hugeWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.hugeWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x1a3050, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0x2a58b0, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xf0c020, 0.65);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.hugeWeapon, 28, 16);
  g.destroy();
}
