import Phaser from 'phaser';
import { gameConfig } from './game/config';
import './styles/main.css';

async function boot(): Promise<void> {
  // Ensure Orbitron is ready before Phaser bakes HUD text textures
  try {
    await document.fonts.load('700 16px Orbitron');
    await document.fonts.ready;
  } catch {
    // Fallback fonts still usable
  }

  const game = new Phaser.Game(gameConfig);

  game.events.once(Phaser.Core.Events.READY, () => {
    const canvas = game.canvas;
    canvas.tabIndex = 0;
    canvas.focus();
    canvas.addEventListener('mousedown', () => {
      canvas.focus();
    });
    canvas.addEventListener('pointerdown', () => {
      canvas.focus();
    });
  });
}

void boot();
