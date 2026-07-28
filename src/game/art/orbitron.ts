import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Orbitron = SVG vectors (isometric portrait + top-down arena body). */
export function preloadOrbitron(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.orbitronPortrait, '/robots/orbitron.svg', {
    width: 300,
    height: 212,
  });
  scene.load.svg(TEXTURE_KEYS.orbitronBody, '/robots/orbitron-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudOrbitron, '/robots/orbitron.svg', {
    width: 50,
    height: 35,
  });
}

export function generateOrbitronTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.orbitronWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.orbitronWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x143888, 1);
  g.fillTriangle(0, 2, 14, 8, 0, 14);
  g.fillStyle(0xc89830, 1);
  g.fillTriangle(14, 2, 28, 8, 14, 14);
  g.fillStyle(0x5a9af0, 0.5);
  g.fillTriangle(2, 6, 10, 8, 2, 10);
  g.generateTexture(TEXTURE_KEYS.orbitronWeapon, 28, 16);
  g.destroy();
}
