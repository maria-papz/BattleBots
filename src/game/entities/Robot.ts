import Phaser from 'phaser';
import {
  ARENA_MARGIN,
  ATTACK_VISUAL_MS,
  DEPTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  KNOCKBACK_DURATION_MS,
} from '../constants';
import type { MovementIntent, RobotId, RobotState, RobotStats } from '../types/game';
import { clamp, degToRad, normalizeAngleDeg, shortestAngleDiffDeg } from '../utils/math';

export class Robot extends Phaser.Physics.Arcade.Image {
  readonly robotId: RobotId;
  readonly stats: RobotStats;
  readonly robotState: RobotState;

  intent: MovementIntent = { forward: 0, rotate: 0, attack: false };

  private weaponMarker: Phaser.GameObjects.Image;
  private attackVisualUntil = 0;
  private knockbackUntil = 0;
  private baseScaleX = 1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    weaponTextureKey: string,
    robotId: RobotId,
    stats: RobotStats,
    facingDeg: number,
  ) {
    super(scene, x, y, textureKey);
    this.robotId = robotId;
    this.stats = stats;
    this.robotState = {
      currentHealth: stats.maxHealth,
      canAttack: true,
      isAttacking: false,
      isDisabled: false,
      lastAttackTime: -Infinity,
    };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTH.robots);
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.setDrag(0);
    this.setMaxVelocity(400);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(stats.bodyRadius);
    body.setOffset(
      this.width / 2 - stats.bodyRadius,
      this.height / 2 - stats.bodyRadius,
    );

    this.setAngle(facingDeg);

    this.weaponMarker = scene.add.image(x, y, weaponTextureKey);
    this.weaponMarker.setDepth(DEPTH.weapon);
    this.weaponMarker.setOrigin(0, 0.5);
    this.weaponMarker.setVisible(false);
    this.baseScaleX = 1;
    this.syncWeaponMarker();
  }

  get facingDeg(): number {
    return normalizeAngleDeg(this.angle);
  }

  refreshCanAttack(now: number, matchActive: boolean): void {
    this.robotState.canAttack =
      matchActive &&
      !this.robotState.isDisabled &&
      now - this.robotState.lastAttackTime >= this.stats.attackCooldown;
  }

  applyMovement(deltaMs: number, now: number): void {
    if (this.robotState.isDisabled) {
      this.setVelocity(0, 0);
      this.syncWeaponMarker();
      return;
    }

    const dt = deltaMs / 1000;
    const rotateIntent = clamp(this.intent.rotate, -1, 1);
    if (rotateIntent !== 0) {
      this.setAngle(
        this.angle + rotateIntent * this.stats.rotationSpeed * dt,
      );
    }

    if (now < this.knockbackUntil) {
      this.syncWeaponMarker();
      this.updateAttackVisual(now);
      return;
    }

    const forwardIntent = clamp(this.intent.forward, -1, 1);
    let speed = 0;
    if (forwardIntent > 0) {
      speed = this.stats.moveSpeed * forwardIntent;
    } else if (forwardIntent < 0) {
      speed = this.stats.reverseSpeed * forwardIntent;
    }

    const rad = degToRad(this.facingDeg);
    this.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
    this.clampToArena();
    this.syncWeaponMarker();
    this.updateAttackVisual(now);
  }

  rotateToward(targetDeg: number, deltaMs: number): number {
    const diff = shortestAngleDiffDeg(this.facingDeg, targetDeg);
    const maxStep = this.stats.rotationSpeed * (deltaMs / 1000);
    if (Math.abs(diff) <= maxStep) {
      this.setAngle(targetDeg);
      return 0;
    }
    this.setAngle(this.angle + Math.sign(diff) * maxStep);
    return diff;
  }

  facingErrorTo(targetX: number, targetY: number): number {
    const bearing =
      (Math.atan2(targetY - this.y, targetX - this.x) * 180) / Math.PI;
    return Math.abs(shortestAngleDiffDeg(this.facingDeg, bearing));
  }

  takeDamage(amount: number): number {
    const applied = Math.min(amount, this.robotState.currentHealth);
    this.robotState.currentHealth = Math.max(
      0,
      this.robotState.currentHealth - applied,
    );
    return applied;
  }

  applyKnockback(fromFacingDeg: number, force: number, now: number): void {
    const rad = degToRad(fromFacingDeg);
    this.setVelocity(Math.cos(rad) * force, Math.sin(rad) * force);
    this.knockbackUntil = now + KNOCKBACK_DURATION_MS;
  }

  beginAttackVisual(now: number): void {
    this.robotState.isAttacking = true;
    this.attackVisualUntil = now + ATTACK_VISUAL_MS;
  }

  setDisabled(disabled: boolean): void {
    this.robotState.isDisabled = disabled;
    if (disabled) {
      this.setVelocity(0, 0);
      this.intent = { forward: 0, rotate: 0, attack: false };
    }
  }

  clampToArena(): void {
    const r = this.stats.bodyRadius;
    const minX = ARENA_MARGIN + r;
    const maxX = GAME_WIDTH - ARENA_MARGIN - r;
    const minY = ARENA_MARGIN + r;
    const maxY = GAME_HEIGHT - ARENA_MARGIN - r;
    this.x = clamp(this.x, minX, maxX);
    this.y = clamp(this.y, minY, maxY);
  }

  getCooldownProgress(now: number): number {
    const elapsed = now - this.robotState.lastAttackTime;
    if (elapsed >= this.stats.attackCooldown) {
      return 1;
    }
    if (!Number.isFinite(this.robotState.lastAttackTime)) {
      return 1;
    }
    return clamp(elapsed / this.stats.attackCooldown, 0, 1);
  }

  override destroy(fromScene?: boolean): void {
    this.weaponMarker.destroy();
    super.destroy(fromScene);
  }

  private syncWeaponMarker(): void {
    const rad = degToRad(this.facingDeg);
    // Sit just ahead of the chassis nose on the 64px sprites
    const offset = this.stats.bodyRadius + 6;
    this.weaponMarker.setPosition(
      this.x + Math.cos(rad) * offset,
      this.y + Math.sin(rad) * offset,
    );
    this.weaponMarker.setAngle(this.facingDeg);
  }

  private updateAttackVisual(now: number): void {
    if (now < this.attackVisualUntil) {
      this.weaponMarker.setVisible(true);
      this.weaponMarker.setScale(1.7, 1.15);
      this.weaponMarker.setAlpha(1);
      return;
    }
    if (this.robotState.isAttacking) {
      this.robotState.isAttacking = false;
    }
    this.weaponMarker.setVisible(false);
    this.weaponMarker.setScale(this.baseScaleX, 1);
  }
}

