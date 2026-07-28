import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Golden Fury = SVG vectors (isometric portrait + top-down arena body). */
export function preloadGoldenFury(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.goldenfuryPortrait, '/robots/goldenfury.svg', {
    width: 300,
    height: 209,
  });
  scene.load.svg(TEXTURE_KEYS.goldenfuryBody, '/robots/goldenfury-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudGoldenfury, '/robots/goldenfury.svg', {
    width: 48,
    height: 33,
  });
}

export function generateGoldenFuryTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.goldenfuryWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.goldenfuryWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x7a0808, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xd01818, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xe8c86a, 0.55);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.goldenfuryWeapon, 28, 16);
  g.destroy();
}
