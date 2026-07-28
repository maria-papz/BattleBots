import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Skorpios = SVG vectors (isometric portrait + top-down arena body). */
export function preloadSkorpios(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.skorpiosPortrait, '/robots/skorpios.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.skorpiosBody, '/robots/skorpios-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudSkorpios, '/robots/skorpios.svg', {
    width: 48,
    height: 34,
  });
}

export function generateSkorpiosTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.skorpiosWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.skorpiosWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x38a8e8, 1);
  g.fillCircle(14, 14, 12);
  g.fillStyle(0x68d0f8, 1);
  g.fillTriangle(14, 2, 18, 8, 10, 8);
  g.fillTriangle(24, 6, 22, 12, 26, 14);
  g.fillTriangle(24, 22, 20, 18, 22, 24);
  g.fillTriangle(14, 26, 16, 20, 10, 22);
  g.fillTriangle(4, 22, 8, 18, 6, 24);
  g.fillTriangle(4, 6, 8, 12, 6, 8);
  g.fillStyle(0x121218, 1);
  g.fillCircle(14, 14, 4);
  g.lineStyle(1, 0x1868a8, 0.9);
  g.strokeCircle(14, 14, 12);
  g.generateTexture(TEXTURE_KEYS.skorpiosWeapon, 28, 28);
  g.destroy();
}
