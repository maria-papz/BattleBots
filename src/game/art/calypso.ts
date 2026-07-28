import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Calypso = SVG vectors (isometric portrait + top-down arena body). */
export function preloadCalypso(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.calypsoPortrait, '/robots/calypso.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.calypsoBody, '/robots/calypso-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudCalypso, '/robots/calypso.svg', {
    width: 48,
    height: 34,
  });
}

export function generateCalypsoTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.calypsoWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.calypsoWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x0a0a0e, 1);
  g.fillEllipse(14, 16, 24, 10);
  g.fillStyle(0x121218, 1);
  g.fillEllipse(14, 16, 18, 6);
  g.fillStyle(0x2a2a30, 1);
  g.fillTriangle(4, 16, 10, 12, 10, 20);
  g.fillTriangle(24, 16, 18, 12, 18, 20);
  g.fillStyle(0x0a0a0e, 1);
  g.fillCircle(14, 16, 3);
  g.lineStyle(1, 0x121218, 0.9);
  g.strokeEllipse(14, 16, 24, 10);
  g.generateTexture(TEXTURE_KEYS.calypsoWeapon, 28, 28);
  g.destroy();
}
