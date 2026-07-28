import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** MadCatter = SVG vectors (isometric portrait + top-down arena body). */
export function preloadMadCatter(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.madcatterPortrait, '/robots/madcatter.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.madcatterBody, '/robots/madcatter-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudMadcatter, '/robots/madcatter.svg', {
    width: 50,
    height: 35,
  });
}

export function generateMadCatterTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.madcatterWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.madcatterWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x1a3878, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0x2e58c1, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0x7ab0ff, 0.5);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.madcatterWeapon, 28, 16);
  g.destroy();
}
