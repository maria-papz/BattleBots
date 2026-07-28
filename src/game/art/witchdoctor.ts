import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../constants';

/** Witch Doctor = SVG vectors (isometric portrait + top-down arena body). */
export function preloadWitchDoctor(scene: Phaser.Scene): void {
  scene.load.svg(TEXTURE_KEYS.witchdoctorPortrait, '/robots/witchdoctor.svg', {
    width: 300,
    height: 213,
  });
  scene.load.svg(TEXTURE_KEYS.witchdoctorBody, '/robots/witchdoctor-top.svg', {
    width: 84,
    height: 84,
  });
  scene.load.svg(TEXTURE_KEYS.hudWitchdoctor, '/robots/witchdoctor.svg', {
    width: 48,
    height: 34,
  });
}

export function generateWitchDoctorTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists(TEXTURE_KEYS.witchdoctorWeapon)) {
    scene.textures.remove(TEXTURE_KEYS.witchdoctorWeapon);
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillEllipse(14, 14, 20, 24);
  g.fillStyle(0xb8ff2a, 1);
  g.fillEllipse(14, 18, 18, 14);
  g.fillStyle(0x0a0a0e, 1);
  g.fillEllipse(9, 10, 5, 6);
  g.fillEllipse(19, 10, 5, 6);
  g.fillEllipse(14, 20, 8, 4);
  g.lineStyle(1, 0x8030c8, 0.9);
  g.strokeEllipse(14, 14, 20, 24);
  g.generateTexture(TEXTURE_KEYS.witchdoctorWeapon, 28, 28);
  g.destroy();
}
