import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Hypershock = SVG vectors (isometric portrait + top-down arena body). */
export function preloadHypershock(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.hypershockPortrait, '/robots/hypershock.svg', {
    width: 310,
    height: 223,
  });
  scene.load.svg(TEXTURE_KEYS.hypershockBody, '/robots/hypershock-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudHypershock, '/robots/hypershock.svg', {
    width: 52,
    height: 37,
  });
}

export function generateHypershockTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.hypershockWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.hypershockWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x4a5260, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xc8d0dc, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xff2a9a, 0.55);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.hypershockWeapon, 28, 16);
  g.destroy();
}
