import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/**
 * Copperhead = SVG vectors (isometric portrait + top-down arena body).
 */
export function preloadCopperhead(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.copperheadPortrait, '/robots/copperhead.svg', {
    width: 280,
    height: 214,
  });
  scene.load.svg(TEXTURE_KEYS.copperheadBody, '/robots/copperhead-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudCopperhead, '/robots/copperhead.svg', {
    width: 40,
    height: 30,
  });
}

export function generateCopperheadTextures(scene: Phaser.Scene): void {
  // Attack flash stays procedural (tiny VFX, not the robot silhouette)
  if (scene.textures.exists(TEXTURE_KEYS.copperheadWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.copperheadWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x9a5018, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xf0a848, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xffe0a8, 0.5);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.copperheadWeapon, 28, 16);
  g.destroy();
}
