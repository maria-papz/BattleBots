import Phaser from 'phaser';
import {
  ARENA_MARGIN,
  DAMAGE_NUMBER_MS,
  DEPTH,
  ENEMY_ORANGE,
  ENEMY_SPAWN,
  FIGHT_FLASH_MS,
  GAME_HEIGHT,
  GAME_WIDTH,
  IMPACT_FLASH_MS,
  MATCH_DURATION_MS,
  PIXEL_FONT,
  PLAYER_CYAN,
  PLAYER_SPAWN,
  READY_DURATION_MS,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_INTENSITY,
  TEXTURE_KEYS,
} from '../constants';
import { sfx } from '../audio/Sfx';
import type { BotProfile } from '../data/botProfile';
import {
  loadFighterWithProfile,
  REGISTRY_BOT_PROFILES,
  REGISTRY_OPPONENT_FIGHTER,
  REGISTRY_PLAYER_FIGHTER,
  type LoadedFighter,
} from '../data/loadBotProfiles';
import { EnemyRobot } from '../entities/EnemyRobot';
import { PlayerRobot } from '../entities/PlayerRobot';
import { Commentator } from '../systems/Commentator';
import { CombatSystem } from '../systems/CombatSystem';
import { EnemyAI } from '../systems/EnemyAI';
import { strategyToAiConfig } from '../systems/StrategyAI';
import type { AttackResult, MatchState } from '../types/game';
import { BattleHud } from '../ui/BattleHud';
import { distance } from '../utils/math';

export class ArenaScene extends Phaser.Scene {
  private player!: PlayerRobot;
  private enemy!: EnemyRobot;
  private combat!: CombatSystem;
  private ai!: EnemyAI;
  private hud!: BattleHud;
  private matchState: MatchState = 'READY';
  private readyEvent?: Phaser.Time.TimerEvent;
  private keyR?: Phaser.Input.Keyboard.Key;
  private keyEsc?: Phaser.Input.Keyboard.Key;
  private prePauseState: MatchState = 'PLAYING';
  private matchRemainingMs = MATCH_DURATION_MS;
  private fightFlashUntil = 0;
  private playerFighter!: LoadedFighter;
  private opponentFighter!: LoadedFighter;
  private commentator?: Commentator;
  private audioUnlock?: () => void;

  constructor() {
    super('ArenaScene');
  }

  create(): void {
    const profiles =
      (this.registry.get(REGISTRY_BOT_PROFILES) as Map<string, BotProfile>) ??
      new Map();
    this.playerFighter = loadFighterWithProfile(
      this.registry.get(REGISTRY_PLAYER_FIGHTER) as string | undefined,
      profiles,
    );
    this.opponentFighter = loadFighterWithProfile(
      this.registry.get(REGISTRY_OPPONENT_FIGHTER) as string | undefined,
      profiles,
    );
    this.matchState = 'READY';
    this.matchRemainingMs = MATCH_DURATION_MS;
    this.fightFlashUntil = 0;
    this.combat = new CombatSystem();
    this.ai = new EnemyAI(
      this.opponentFighter.strategy,
      strategyToAiConfig(this.opponentFighter.strategy),
    );
    this.commentator = new Commentator(
      this,
      this.playerFighter,
      this.opponentFighter,
    );
    void this.commentator.init();

    this.drawArena();
    this.setupBounds();
    this.createRobots();
    this.hud = new BattleHud(this, {
      playerName: this.playerFighter.shortName,
      playerAccent: this.playerFighter.accent,
      playerAccentHex: this.playerFighter.accentHex,
      playerIcon: this.playerFighter.hudKey,
      enemyName: this.opponentFighter.shortName,
      enemyAccent: this.opponentFighter.accent,
      enemyAccentHex: this.opponentFighter.accentHex,
      enemyIcon: this.opponentFighter.hudKey,
    });
    this.drawLightingPass();
    this.setupKeys();
    this.setupAudioUnlock();
    this.startReadyCountdown();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.onShutdown());
  }

  update(time: number, delta: number): void {
    this.handleGlobalKeys();

    if (this.matchState === 'PAUSED') {
      this.syncHud(time);
      return;
    }

    const playing = this.matchState === 'PLAYING';

    this.player.refreshCanAttack(time, playing);
    this.enemy.refreshCanAttack(time, playing);

    if (playing) {
      this.matchRemainingMs = Math.max(0, this.matchRemainingMs - delta);
      this.player.readInput(this.matchState);
      this.ai.update(this.enemy, this.player, delta, this.matchState, time);
    } else {
      this.player.intent = { forward: 0, rotate: 0, attack: false };
      this.enemy.setIntent({ forward: 0, rotate: 0, attack: false });
    }

    this.player.applyMovement(delta, time);
    this.enemy.applyMovement(delta, time);
    this.separateRobots();

    if (playing) {
      const playerHit = this.combat.tryAttack(
        this.player,
        this.enemy,
        time,
        this.matchState,
      );
      this.handleAttackResult(playerHit, this.enemy, this.player);

      const enemyHit = this.combat.tryAttack(
        this.enemy,
        this.player,
        time,
        this.matchState,
      );
      this.handleAttackResult(enemyHit, this.player, this.enemy);
      if (enemyHit.hit) {
        this.ai.notifyHitLanded();
      }

      this.checkWinLoss();
      if (this.matchState === 'PLAYING' && this.matchRemainingMs <= 0) {
        this.endByTimer();
      }

      this.commentator?.update(
        this.player.robotState.currentHealth,
        this.enemy.robotState.currentHealth,
        time,
      );
    }

    this.syncHud(time);
  }

  private drawArena(): void {
    const floorLeft = ARENA_MARGIN;
    const floorTop = ARENA_MARGIN;
    const floorRight = GAME_WIDTH - ARENA_MARGIN;
    const floorBottom = GAME_HEIGHT - ARENA_MARGIN;
    const floorW = floorRight - floorLeft;
    const floorH = floorBottom - floorTop;
    const stripe = 24;
    const wallFace = 26;

    // Outer studio pit — almost black (arena sits in a dark booth)
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06080c)
      .setDepth(DEPTH.studio);

    // Raised wall mass (outside playfield)
    for (let y = 0; y < GAME_HEIGHT; y += 32) {
      for (let x = 0; x < GAME_WIDTH; x += 32) {
        const inside =
          x + 16 > floorLeft - wallFace &&
          x + 16 < floorRight + wallFace &&
          y + 16 > floorTop - wallFace &&
          y + 16 < floorBottom + wallFace;
        if (inside) continue;
        this.add.image(x + 16, y + 16, TEXTURE_KEYS.wallTile).setDepth(DEPTH.wall);
      }
    }

    // Beveled wall faces (isometric raised lip around floor)
    for (let x = floorLeft; x < floorRight; x += 32) {
      this.add
        .image(x + 16, floorTop - wallFace / 2, TEXTURE_KEYS.wallFace)
        .setDepth(DEPTH.wall);
      this.add
        .image(x + 16, floorBottom + wallFace / 2, TEXTURE_KEYS.wallFace)
        .setDepth(DEPTH.wall)
        .setFlipY(true);
    }
    for (let y = floorTop; y < floorBottom; y += 24) {
      this.add
        .image(floorLeft - wallFace / 2, y + 12, TEXTURE_KEYS.wallFace)
        .setDepth(DEPTH.wall)
        .setAngle(-90);
      this.add
        .image(floorRight + wallFace / 2, y + 12, TEXTURE_KEYS.wallFace)
        .setDepth(DEPTH.wall)
        .setAngle(90);
    }

    // Metal plate floor
    let flip = false;
    for (let y = floorTop; y < floorBottom; y += 32) {
      flip = !flip;
      let row = flip;
      for (let x = floorLeft; x < floorRight; x += 32) {
        this.add
          .image(
            x + 16,
            y + 16,
            row ? TEXTURE_KEYS.floorTileAlt : TEXTURE_KEYS.floorTile,
          )
          .setDepth(DEPTH.floor);
        row = !row;
      }
    }

    // Soft overhead pool — brighter center, darker near walls
    const pool = this.add.graphics().setDepth(DEPTH.glow);
    pool.fillStyle(0xffffff, 0.035);
    pool.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, floorW * 0.72, floorH * 0.62);
    pool.fillStyle(0xffffff, 0.02);
    pool.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT / 2, floorW * 0.45, floorH * 0.4);

    // Soft filled square spawn pads
    const padWash = this.add.graphics().setDepth(DEPTH.glow);
    padWash.fillStyle(PLAYER_CYAN, 0.14);
    padWash.fillRect(PLAYER_SPAWN.x - 48, PLAYER_SPAWN.y - 48, 96, 96);
    padWash.fillStyle(ENEMY_ORANGE, 0.14);
    padWash.fillRect(ENEMY_SPAWN.x - 48, ENEMY_SPAWN.y - 48, 96, 96);
    this.add
      .image(PLAYER_SPAWN.x, PLAYER_SPAWN.y, TEXTURE_KEYS.startBlue)
      .setDepth(DEPTH.marks)
      .setAlpha(0.75);
    this.add
      .image(ENEMY_SPAWN.x, ENEMY_SPAWN.y, TEXTURE_KEYS.startRed)
      .setDepth(DEPTH.marks)
      .setAlpha(0.75);

    // Centered faded BB floor decal
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, TEXTURE_KEYS.bbLogo)
      .setDepth(DEPTH.marks)
      .setAlpha(0.36)
      .setScale(1.0);

    const pads = [
      { x: GAME_WIDTH / 2 - 150, y: floorTop + 90 },
      { x: GAME_WIDTH / 2 + 150, y: floorTop + 90 },
      { x: GAME_WIDTH / 2 - 150, y: floorBottom - 90 },
      { x: GAME_WIDTH / 2 + 150, y: floorBottom - 90 },
    ];
    for (const p of pads) {
      this.add.image(p.x, p.y, TEXTURE_KEYS.hazardPad).setDepth(DEPTH.marks);
    }

    // Thick caution stripe band
    for (let x = floorLeft; x < floorRight; x += stripe) {
      this.add
        .image(x + stripe / 2, floorTop + stripe / 2, TEXTURE_KEYS.hazardStripe)
        .setDepth(DEPTH.decor);
      this.add
        .image(x + stripe / 2, floorBottom - stripe / 2, TEXTURE_KEYS.hazardStripe)
        .setDepth(DEPTH.decor);
    }
    for (let y = floorTop; y < floorBottom; y += stripe) {
      this.add
        .image(floorLeft + stripe / 2, y + stripe / 2, TEXTURE_KEYS.hazardStripe)
        .setDepth(DEPTH.decor);
      this.add
        .image(floorRight - stripe / 2, y + stripe / 2, TEXTURE_KEYS.hazardStripe)
        .setDepth(DEPTH.decor);
    }

    this.add
      .image(GAME_WIDTH / 2, floorTop + 38, TEXTURE_KEYS.pulverizer)
      .setDepth(DEPTH.decor);
    this.add
      .image(GAME_WIDTH / 2, floorBottom - 38, TEXTURE_KEYS.pulverizer)
      .setDepth(DEPTH.decor)
      .setAngle(180);

    // Sparse wall lamps — slightly larger recessed fixtures + soft falloff
    const placeLamp = (
      x: number,
      y: number,
      blue: boolean,
      spillX: number,
      spillY: number,
    ) => {
      const g = this.add.graphics().setDepth(DEPTH.border);
      const c = blue ? PLAYER_CYAN : ENEMY_ORANGE;
      // Layered falloff (outer → inner) for a real lamp wash
      g.fillStyle(c, 0.03);
      g.fillEllipse(x + spillX, y + spillY, 70, 48);
      g.fillStyle(c, 0.055);
      g.fillEllipse(x + spillX * 0.75, y + spillY * 0.75, 44, 30);
      g.fillStyle(c, 0.09);
      g.fillEllipse(x + spillX * 0.45, y + spillY * 0.45, 22, 14);
      // Recessed housing
      g.fillStyle(0x06080c, 1);
      g.fillRoundedRect(x - 6, y - 5, 12, 9, 2);
      g.fillStyle(0x1a2030, 1);
      g.fillRoundedRect(x - 5, y - 4, 10, 7, 1);
      // Lit aperture
      g.fillStyle(c, 0.85);
      g.fillRoundedRect(x - 3, y - 2, 6, 3, 1);
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(x - 2, y - 1, 2, 1);
    };
    // 3 per side — mid + upper/lower thirds
    const lampYs = [
      floorTop + floorH * 0.28,
      GAME_HEIGHT / 2,
      floorBottom - floorH * 0.28,
    ];
    for (const y of lampYs) {
      placeLamp(floorLeft + 36, y, true, 22, 0);
      placeLamp(floorRight - 36, y, false, -22, 0);
    }

    // Contact shadow under wall lips (grounds the raised border)
    const ao = this.add.graphics().setDepth(DEPTH.decor);
    ao.fillStyle(0x000000, 0.35);
    ao.fillRect(floorLeft, floorTop, floorW, 6);
    ao.fillRect(floorLeft, floorBottom - 6, floorW, 6);
    ao.fillRect(floorLeft, floorTop, 6, floorH);
    ao.fillRect(floorRight - 6, floorTop, 6, floorH);

    // Outer cage rail — darker steel
    const cage = this.add.graphics().setDepth(DEPTH.border);
    cage.lineStyle(4, 0x1a2030, 1);
    cage.strokeRect(
      floorLeft - wallFace - 2,
      floorTop - wallFace - 2,
      floorW + wallFace * 2 + 4,
      floorH + wallFace * 2 + 4,
    );
    cage.lineStyle(2, 0x2a3040, 0.7);
    cage.strokeRect(floorLeft - 1, floorTop - 1, floorW + 2, floorH + 2);

    for (const p of [
      { x: floorLeft - wallFace, y: floorTop - wallFace },
      { x: floorRight + wallFace, y: floorTop - wallFace },
      { x: floorLeft - wallFace, y: floorBottom + wallFace },
      { x: floorRight + wallFace, y: floorBottom + wallFace },
    ]) {
      this.add.image(p.x, p.y, TEXTURE_KEYS.cagePost).setDepth(DEPTH.border);
    }
  }

  /** Screen-space vignette — dark booth surround, straight top-down view. */
  private drawLightingPass(): void {
    this.cameras.main.setBackgroundColor(0x06080c);

    const vig = this.add.graphics().setScrollFactor(0).setDepth(DEPTH.scanlines);
    vig.fillStyle(0x020308, 0.5);
    vig.fillRect(0, 0, GAME_WIDTH, 44);
    vig.fillRect(0, GAME_HEIGHT - 48, GAME_WIDTH, 48);
    vig.fillRect(0, 0, 32, GAME_HEIGHT);
    vig.fillRect(GAME_WIDTH - 32, 0, 32, GAME_HEIGHT);
    vig.fillStyle(0x000000, 0.22);
    vig.fillCircle(0, 0, 130);
    vig.fillCircle(GAME_WIDTH, 0, 130);
    vig.fillCircle(0, GAME_HEIGHT, 150);
    vig.fillCircle(GAME_WIDTH, GAME_HEIGHT, 150);
    vig.lineStyle(36, 0x000000, 0.16);
    vig.strokeRoundedRect(44, 40, GAME_WIDTH - 88, GAME_HEIGHT - 80, 8);
  }

  private setupBounds(): void {
    this.physics.world.setBounds(
      ARENA_MARGIN,
      ARENA_MARGIN,
      GAME_WIDTH - ARENA_MARGIN * 2,
      GAME_HEIGHT - ARENA_MARGIN * 2,
    );
  }

  private createRobots(): void {
    this.player = new PlayerRobot(
      this,
      PLAYER_SPAWN.x,
      PLAYER_SPAWN.y,
      0,
      this.playerFighter,
    );
    this.enemy = new EnemyRobot(
      this,
      ENEMY_SPAWN.x,
      ENEMY_SPAWN.y,
      180,
      this.opponentFighter,
    );
    this.physics.add.collider(this.player, this.enemy);
  }

  private setupKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    this.keyR = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyEsc = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private setupAudioUnlock(): void {
    this.audioUnlock = () => sfx.unlock();
    this.input.keyboard?.on('keydown', this.audioUnlock);
    this.input.on('pointerdown', this.audioUnlock);
  }

  private startReadyCountdown(): void {
    // Allow visual QA screenshots to skip the READY overlay: ?skipReady=1
    const skipReady =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('skipReady');
    if (skipReady) {
      this.matchState = 'PLAYING';
      this.fightFlashUntil = 0;
      this.hud.setStatus('', '');
      this.hud.setMatchStatusLabel('LIVE');
      return;
    }

    this.hud.setStatus('READY?', 'GET SET');
    this.hud.setMatchStatusLabel('READY');
    this.readyEvent = this.time.delayedCall(READY_DURATION_MS, () => {
      if (this.matchState !== 'READY') return;
      this.matchState = 'PLAYING';
      this.fightFlashUntil = this.time.now + FIGHT_FLASH_MS;
      this.hud.setStatus('FIGHT!', 'MAKE IT COUNT');
      this.hud.setMatchStatusLabel('LIVE');
      sfx.fight();
      void this.commentator?.playIntro();
    });
  }

  private handleGlobalKeys(): void {
    if (
      this.keyEsc &&
      Phaser.Input.Keyboard.JustDown(this.keyEsc) &&
      (this.matchState === 'PLAYING' || this.matchState === 'PAUSED')
    ) {
      if (this.matchState === 'PLAYING') {
        this.prePauseState = 'PLAYING';
        this.matchState = 'PAUSED';
        this.player.setVelocity(0, 0);
        this.enemy.setVelocity(0, 0);
        this.hud.setMatchStatusLabel('PAUSE');
      } else {
        this.matchState = this.prePauseState;
        this.hud.setMatchStatusLabel('LIVE');
      }
    }

    if (
      this.keyR &&
      Phaser.Input.Keyboard.JustDown(this.keyR) &&
      (this.matchState === 'PLAYER_WON' || this.matchState === 'PLAYER_LOST')
    ) {
      this.scene.start('SelectScene');
    }
  }

  private separateRobots(): void {
    const minDist =
      this.player.stats.bodyRadius + this.enemy.stats.bodyRadius;
    const dist = distance(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y,
    );
    if (dist >= minDist || dist === 0) {
      this.player.clampToArena();
      this.enemy.clampToArena();
      return;
    }

    const overlap = minDist - dist;
    const nx = (this.enemy.x - this.player.x) / dist;
    const ny = (this.enemy.y - this.player.y) / dist;
    const push = overlap * 0.5;
    this.player.x -= nx * push;
    this.player.y -= ny * push;
    this.enemy.x += nx * push;
    this.enemy.y += ny * push;
    this.player.clampToArena();
    this.enemy.clampToArena();

    // Tiny collision sparks
    if (overlap > 2) {
      const spark = this.add
        .image(
          (this.player.x + this.enemy.x) / 2,
          (this.player.y + this.enemy.y) / 2,
          TEXTURE_KEYS.spark,
        )
        .setDepth(DEPTH.fx)
        .setScale(0.8);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.3,
        duration: 180,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private handleAttackResult(
    result: AttackResult,
    target: PlayerRobot | EnemyRobot,
    attacker: PlayerRobot | EnemyRobot,
  ): void {
    if (result.blockedByCooldown) {
      // Only show for player presses to avoid AI spam
      if (attacker.robotId === 'player') {
        this.hud.floatCallout(attacker.x, attacker.y, 'WEAPON DISABLED', '#8a93a5');
      }
      return;
    }
    if (!result.fired) return;

    // Quiet swing for player attacks only (AI swings would stack noise)
    if (attacker.robotId === 'player') {
      sfx.swing(attacker.weaponClass);
    } else {
      sfx.swing(attacker.weaponClass);
    }

    if (!result.hit) return;

    sfx.hit(result.damage >= 12);
    this.cameras.main.shake(SCREEN_SHAKE_DURATION_MS, SCREEN_SHAKE_INTENSITY);

    const flash = this.add
      .image(target.x, target.y, TEXTURE_KEYS.impact)
      .setDepth(DEPTH.fx)
      .setScale(1.15);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: IMPACT_FLASH_MS + 30,
      onComplete: () => flash.destroy(),
    });

    for (let i = 0; i < 4; i++) {
      const spark = this.add
        .image(target.x, target.y, TEXTURE_KEYS.spark)
        .setDepth(DEPTH.fx);
      this.tweens.add({
        targets: spark,
        x: target.x + Phaser.Math.Between(-28, 28),
        y: target.y + Phaser.Math.Between(-28, 28),
        alpha: 0,
        duration: 260,
        onComplete: () => spark.destroy(),
      });
    }

    const smoke = this.add
      .image(target.x, target.y - 4, TEXTURE_KEYS.smoke)
      .setDepth(DEPTH.fx)
      .setAlpha(0.7);
    this.tweens.add({
      targets: smoke,
      y: target.y - 22,
      alpha: 0,
      scale: 1.6,
      duration: 420,
      onComplete: () => smoke.destroy(),
    });

    const critical = result.damage >= 12;
    const effectLabel =
      result.effects?.includes('launch')
        ? 'LAUNCHED'
        : result.effects?.includes('grind')
          ? 'GRINDING'
          : result.effects?.includes('precision')
            ? 'CLEAN HIT'
            : result.effects?.includes('undercut')
              ? 'UNDERCUT'
              : result.effects?.includes('double_hit')
                ? 'DOUBLE'
                : critical
                  ? 'CRITICAL'
                  : 'HIT';
    this.hud.floatCallout(
      target.x,
      target.y,
      effectLabel,
      critical || result.effects?.length ? '#f7d038' : '#ffffff',
    );

    const dmg = this.add
      .text(target.x, target.y - 30, `-${result.damage}`, {
        fontFamily: PIXEL_FONT,
        fontSize: '10px',
        color: '#f7d038',
        stroke: '#0a0c12',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.fx);
    this.tweens.add({
      targets: dmg,
      y: target.y - 56,
      alpha: 0,
      duration: DAMAGE_NUMBER_MS,
      onComplete: () => dmg.destroy(),
    });
  }

  private checkWinLoss(): void {
    if (this.enemy.robotState.currentHealth <= 0) {
      this.hud.floatCallout(this.enemy.x, this.enemy.y, 'KO', '#ff5c4d');
      this.endMatch('PLAYER_WON');
      return;
    }
    if (this.player.robotState.currentHealth <= 0) {
      this.hud.floatCallout(this.player.x, this.player.y, 'KO', '#ff5c4d');
      this.endMatch('PLAYER_LOST');
    }
  }

  private endByTimer(): void {
    const p = this.player.robotState.currentHealth;
    const e = this.enemy.robotState.currentHealth;
    if (p > e) this.endMatch('PLAYER_WON');
    else this.endMatch('PLAYER_LOST');
  }

  private endMatch(result: 'PLAYER_WON' | 'PLAYER_LOST'): void {
    this.matchState = result;
    this.player.setDisabled(true);
    this.enemy.setDisabled(true);
    this.hud.setMatchStatusLabel(result === 'PLAYER_WON' ? 'WIN' : 'LOSS');
    sfx.end(result === 'PLAYER_WON');
  }

  private syncHud(now: number): void {
    this.hud.setHealth(
      this.player.robotState.currentHealth,
      this.player.stats.maxHealth,
      this.enemy.robotState.currentHealth,
      this.enemy.stats.maxHealth,
    );
    this.hud.setMeters(
      this.player.getCooldownProgress(now),
      this.enemy.getCooldownProgress(now),
    );
    this.hud.setTimerMs(this.matchRemainingMs);

    switch (this.matchState) {
      case 'READY':
        this.hud.setStatus('READY?', 'GET SET');
        break;
      case 'PLAYING':
        if (now < this.fightFlashUntil) {
          this.hud.setStatus('FIGHT!', 'MAKE IT COUNT');
        } else {
          this.hud.setStatus('', '');
        }
        break;
      case 'PLAYER_WON':
        this.hud.setStatus('VICTORY!', 'Press R to choose fighter');
        break;
      case 'PLAYER_LOST':
        this.hud.setStatus('DEFEAT', 'Press R to choose fighter');
        break;
      case 'PAUSED':
        this.hud.setStatus('PAUSED', 'ESC to resume');
        break;
    }
  }

  private onShutdown(): void {
    this.readyEvent?.remove(false);
    this.readyEvent = undefined;

    if (this.audioUnlock) {
      this.input.keyboard?.off('keydown', this.audioUnlock);
      this.input.off('pointerdown', this.audioUnlock);
      this.audioUnlock = undefined;
    }

    this.tweens.killAll();
    this.time.removeAllEvents();
    this.cameras.main.resetFX();

    this.commentator?.destroy();
    this.commentator = undefined;
    this.hud?.destroy();

    if (this.player?.active) {
      this.player.destroy(true);
    }
    if (this.enemy?.active) {
      this.enemy.destroy(true);
    }
  }
}
