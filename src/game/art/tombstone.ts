import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Tombstone = SVG vectors (isometric portrait + top-down arena body). */
export function preloadTombstone(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.tombstonePortrait, '/robots/tombstone.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.tombstoneBody, '/robots/tombstone-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudTombstone, '/robots/tombstone.svg', {
    width: 48,
    height: 34,
  });
}

export function generateTombstoneTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.tombstoneWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.tombstoneWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xd02838, 1);
  g.fillRect(0, 10, 28, 6);
  g.fillStyle(0xff5060, 0.45);
  g.fillRect(2, 11, 24, 2);
  g.fillStyle(0x801018, 1);
  g.fillRect(0, 10, 3, 6);
  g.fillRect(25, 10, 3, 6);
  g.lineStyle(1, 0x801018, 0.9);
  g.strokeRect(0, 10, 28, 6);
  g.generateTexture(TEXTURE_KEYS.tombstoneWeapon, 28, 28);
  g.destroy();
}
