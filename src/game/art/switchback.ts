import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Switchback = SVG vectors (isometric portrait + top-down arena body). */
export function preloadSwitchback(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.switchbackPortrait, '/robots/switchback.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.switchbackBody, '/robots/switchback-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudSwitchback, '/robots/switchback.svg', {
    width: 48,
    height: 34,
  });
}

export function generateSwitchbackTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.switchbackWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.switchbackWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x121218, 1);
  g.fillTriangle(0, 10, 26, 2, 26, 18);
  g.fillStyle(0xf07810, 1);
  g.fillTriangle(4, 10, 22, 5, 22, 15);
  g.fillStyle(0xffffff, 0.45);
  g.fillRect(8, 8, 10, 2);
  g.lineStyle(1, 0x0a0a0e, 0.9);
  g.strokeTriangle(0, 10, 26, 2, 26, 18);
  g.generateTexture(TEXTURE_KEYS.switchbackWeapon, 28, 20);
  g.destroy();
}
