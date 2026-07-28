import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** The Twins = SVG vectors (isometric portrait + top-down arena body). */
export function preloadTheTwins(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.thetwinsPortrait, '/robots/thetwins.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.thetwinsBody, '/robots/thetwins-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudThetwins, '/robots/thetwins.svg', {
    width: 48,
    height: 34,
  });
}

export function generateTheTwinsTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.thetwinsWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.thetwinsWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x2a2a30, 1);
  g.fillTriangle(4, 4, 12, 18, 4, 18);
  g.fillTriangle(16, 4, 24, 18, 16, 18);
  g.fillStyle(0x121218, 1);
  g.fillTriangle(5, 10, 11, 16, 5, 16);
  g.fillTriangle(17, 10, 23, 16, 17, 16);
  g.lineStyle(1, 0x0a0a0e, 0.9);
  g.strokeTriangle(4, 4, 12, 18, 4, 18);
  g.strokeTriangle(16, 4, 24, 18, 16, 18);
  g.generateTexture(TEXTURE_KEYS.thetwinsWeapon, 28, 20);
  g.destroy();
}
