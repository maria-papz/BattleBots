import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Terrortops = SVG vectors (isometric portrait + top-down arena body). */
export function preloadTerrortops(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.terrortopsPortrait, '/robots/terrortops.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.terrortopsBody, '/robots/terrortops-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudTerrortops, '/robots/terrortops.svg', {
    width: 48,
    height: 34,
  });
}

export function generateTerrortopsTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.terrortopsWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.terrortopsWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xf0d020, 1);
  g.fillEllipse(14, 14, 24, 12);
  g.fillStyle(0xffe860, 1);
  g.fillTriangle(2, 14, 14, 4, 14, 10);
  g.fillTriangle(26, 14, 14, 24, 14, 18);
  g.fillStyle(0x0a0a0e, 1);
  g.fillCircle(14, 14, 3);
  g.lineStyle(1, 0xc8a008, 0.9);
  g.strokeEllipse(14, 14, 24, 12);
  g.generateTexture(TEXTURE_KEYS.terrortopsWeapon, 28, 28);
  g.destroy();
}
