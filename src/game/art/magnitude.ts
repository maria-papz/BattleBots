import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Magnitude = SVG vectors (isometric portrait + top-down arena body). */
export function preloadMagnitude(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.magnitudePortrait, '/robots/magnitude.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.magnitudeBody, '/robots/magnitude-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudMagnitude, '/robots/magnitude.svg', {
    width: 50,
    height: 35,
  });
}

export function generateMagnitudeTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.magnitudeWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.magnitudeWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x585860, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xdfff00, 1);
  g.fillTriangle(4, 5, 22, 8, 4, 11);
  g.fillStyle(0xf0ff60, 0.45);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.magnitudeWeapon, 28, 16);
  g.destroy();
}
