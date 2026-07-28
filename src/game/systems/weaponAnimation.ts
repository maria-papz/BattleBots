import type { WeaponClass } from '../data/botProfile';
import { ATTACK_VISUAL_MS } from '../constants';

export function playWeaponAttackVisual(
  scene: Phaser.Scene,
  weaponClass: WeaponClass,
  marker: Phaser.GameObjects.Image,
  until: number,
  now: number,
): void {
  marker.setVisible(true);
  marker.setAlpha(1);

  switch (weaponClass) {
    case 'horizontal_spinner':
    case 'vertical_spinner':
    case 'undercutter':
      marker.setScale(1.8, 1.1);
      scene.tweens.add({
        targets: marker,
        angle: marker.angle + 360,
        duration: ATTACK_VISUAL_MS,
        ease: 'Linear',
      });
      break;
    case 'drum':
      marker.setScale(2.0, 1.3);
      scene.tweens.add({
        targets: marker,
        scaleX: 2.4,
        scaleY: 1.5,
        yoyo: true,
        duration: ATTACK_VISUAL_MS / 2,
        ease: 'Quad.easeOut',
      });
      break;
    case 'flipper':
      marker.setScale(1.5, 1.2);
      scene.tweens.add({
        targets: marker,
        angle: marker.angle - 45,
        yoyo: true,
        duration: ATTACK_VISUAL_MS,
        ease: 'Back.easeOut',
      });
      break;
    case 'saw':
      marker.setScale(1.7, 1.1);
      scene.tweens.add({
        targets: marker,
        angle: marker.angle + 90,
        yoyo: true,
        duration: ATTACK_VISUAL_MS,
        ease: 'Sine.easeInOut',
      });
      break;
    case 'dual_spinner':
    case 'multibot':
      marker.setScale(2.2, 1.4);
      marker.setAlpha(0.95);
      break;
    default:
      marker.setScale(1.7, 1.15);
  }

  if (now >= until) {
    marker.setVisible(false);
    marker.setScale(1, 1);
  }
}

export function resetWeaponMarker(marker: Phaser.GameObjects.Image): void {
  marker.setVisible(false);
  marker.setScale(1, 1);
  marker.setAlpha(1);
}
