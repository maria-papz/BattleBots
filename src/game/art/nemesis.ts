import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Nemesis = SVG vectors (isometric portrait + top-down arena body). */
export function preloadNemesis(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.nemesisPortrait, '/robots/nemesis.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.nemesisBody, '/robots/nemesis-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudNemesis, '/robots/nemesis.svg', {
    width: 48,
    height: 34,
  });
}

export function generateNemesisTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.nemesisWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.nemesisWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xd02838, 1);
  g.fillEllipse(14, 14, 16, 24);
  g.fillStyle(0xff4858, 1);
  g.fillTriangle(14, 2, 20, 12, 14, 14);
  g.fillStyle(0xa01828, 1);
  g.fillTriangle(8, 12, 14, 14, 8, 16);
  g.fillStyle(0x0a0a0e, 1);
  g.fillCircle(14, 14, 3);
  g.lineStyle(1, 0x801018, 0.9);
  g.strokeEllipse(14, 14, 16, 24);
  g.generateTexture(TEXTURE_KEYS.nemesisWeapon, 28, 28);
  g.destroy();
}
