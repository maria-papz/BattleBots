import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Manta = SVG vectors (isometric portrait + top-down arena body). */
export function preloadManta(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.mantaPortrait, '/robots/manta.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.mantaBody, '/robots/manta-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudManta, '/robots/manta.svg', {
    width: 50,
    height: 35,
  });
}

export function generateMantaTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.mantaWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.mantaWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x6a4808, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xe0b020, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xffe060, 0.5);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.mantaWeapon, 28, 16);
  g.destroy();
}
