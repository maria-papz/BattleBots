import Phaser from 'phaser';
import {
  ARENA_MARGIN,
  ATTACK_VISUAL_MS,
  DEPTH,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRIND_DAMAGE,
  GRIND_DURATION_MS,
  GRIND_TICK_MS,
  KNOCKBACK_DURATION_MS,
  STUN_DURATION_MS,
} from '../constants';
import type { MovementIntent, RobotId, RobotState, RobotStats } from '../types/game';
import type { WeaponClass } from '../data/botProfile';
import { playWeaponAttackVisual, resetWeaponMarker } from '../systems/weaponAnimation';
import { clamp, degToRad, normalizeAngleDeg, shortestAngleDiffDeg } from '../utils/math';

export class Robot extends Phaser.Physics.Arcade.Image {
  readonly robotId: RobotId;
  readonly stats: RobotStats;
  readonly robotState: RobotState;
  readonly weaponClass: WeaponClass;

  intent: MovementIntent = { forward: 0, rotate: 0, attack: false };

  private weaponMarker: Phaser.GameObjects.Image;
  private attackVisualUntil = 0;
  private knockbackUntil = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    weaponTextureKey: string,
    robotId: RobotId,
    stats: RobotStats,
    facingDeg: number,
    weaponClass: WeaponClass = 'vertical_spinner',
  ) {
    super(scene, x, y, textureKey);
    this.robotId = robotId;
    this.stats = stats;
    this.weaponClass = weaponClass;
    this.robotState = {
      currentHealth: stats.maxHealth,
      canAttack: true,
      isAttacking: false,
      isDisabled: false,
      lastAttackTime: -Infinity,
      stunnedUntil: 0,
      grindUntil: 0,
      lastGrindTick: 0,
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
    this.syncWeaponMarker();
  }

  get facingDeg(): number {
    return normalizeAngleDeg(this.angle);
  }

  refreshCanAttack(now: number, matchActive: boolean): void {
    this.robotState.canAttack =
      matchActive &&
      !this.robotState.isDisabled &&
      !this.isStunned(now) &&
      now - this.robotState.lastAttackTime >= this.stats.attackCooldown;
  }

  isStunned(now: number): boolean {
    return now < this.robotState.stunnedUntil;
  }

  isGrinding(now: number): boolean {
    return now < this.robotState.grindUntil;
  }

  applyMovement(deltaMs: number, now: number): void {
    if (this.robotState.isDisabled) {
      this.setVelocity(0, 0);
      this.syncWeaponMarker();
      return;
    }

    this.tickGrindDamage(now);

    const dt = deltaMs / 1000;
    const stunned = this.isStunned(now);

    if (!stunned) {
      const rotateIntent = clamp(this.intent.rotate, -1, 1);
      if (rotateIntent !== 0) {
        this.setAngle(
          this.angle + rotateIntent * this.stats.rotationSpeed * dt,
        );
      }
    }

    if (now < this.knockbackUntil) {
      this.syncWeaponMarker();
      this.updateAttackVisual(now);
      return;
    }

    if (stunned) {
      this.setVelocity(0, 0);
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

  applyStun(now: number, durationMs = STUN_DURATION_MS): void {
    this.robotState.stunnedUntil = Math.max(
      this.robotState.stunnedUntil,
      now + durationMs,
    );
    this.intent = { forward: 0, rotate: 0, attack: false };
  }

  applyGrind(now: number): void {
    this.robotState.grindUntil = now + GRIND_DURATION_MS;
    this.robotState.lastGrindTick = now;
  }

  private tickGrindDamage(now: number): void {
    if (!this.isGrinding(now)) {
      return;
    }
    if (now - this.robotState.lastGrindTick < GRIND_TICK_MS) {
      return;
    }
    this.robotState.lastGrindTick = now;
    this.takeDamage(GRIND_DAMAGE);
  }

  beginAttackVisual(now: number): void {
    this.robotState.isAttacking = true;
    this.attackVisualUntil = now + ATTACK_VISUAL_MS;
    playWeaponAttackVisual(
      this.scene,
      this.weaponClass,
      this.weaponMarker,
      this.attackVisualUntil,
      now,
    );
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
      return;
    }
    if (this.robotState.isAttacking) {
      this.robotState.isAttacking = false;
    }
    resetWeaponMarker(this.weaponMarker);
  }
}

