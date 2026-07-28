import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Valkyrie = SVG vectors (isometric portrait + top-down arena body). */
export function preloadValkyrie(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.valkyriePortrait, '/robots/valkyrie.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.valkyrieBody, '/robots/valkyrie-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudValkyrie, '/robots/valkyrie.svg', {
    width: 48,
    height: 34,
  });
}

export function generateValkyrieTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.valkyrieWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.valkyrieWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x9858c8, 1);
  g.fillEllipse(14, 16, 24, 14);
  g.fillStyle(0xc888f0, 0.45);
  g.fillEllipse(16, 16, 16, 8);
  g.fillStyle(0x7040a0, 1);
  g.fillEllipse(22, 16, 10, 6);
  g.lineStyle(1, 0x503080, 0.9);
  g.strokeEllipse(14, 16, 24, 14);
  g.generateTexture(TEXTURE_KEYS.valkyrieWeapon, 28, 28);
  g.destroy();
}
