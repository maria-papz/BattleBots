import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Jackpot = SVG vectors (isometric portrait + top-down arena body). */
export function preloadJackpot(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.jackpotPortrait, '/robots/jackpot.svg', {
    width: 300,
    height: 235,
  });
  scene.load.svg(TEXTURE_KEYS.jackpotBody, '/robots/jackpot-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudJackpot, '/robots/jackpot.svg', {
    width: 48,
    height: 37,
  });
}

export function generateJackpotTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.jackpotWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.jackpotWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xa01018, 1);
  g.fillTriangle(0, 3, 28, 8, 0, 13);
  g.fillStyle(0xe01828, 1);
  g.fillTriangle(3, 5, 22, 8, 3, 11);
  g.fillStyle(0xff6a7a, 0.5);
  g.fillTriangle(2, 7, 12, 8, 2, 9);
  g.generateTexture(TEXTURE_KEYS.jackpotWeapon, 28, 16);
  g.destroy();
}
