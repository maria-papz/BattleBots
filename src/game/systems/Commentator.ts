import type { LoadedFighter } from '../data/loadBotProfiles';

export interface CommentaryRequest {
  type: 'intro' | 'trailing';
  player: { name: string; weapon: string; record?: string; strategyNotes: string };
  opponent: { name: string; weapon: string; record?: string; strategyNotes: string };
  trailingBot?: string;
}

export class Commentator {
  private enabled = false;
  private checked = false;
  private playing = false;
  private aborted = false;
  private trailingCalled = false;
  private lastTrailingAt = 0;
  private subtitle?: Phaser.GameObjects.Text;
  private readonly trailGap = 0.25;
  private readonly trailCooldownMs = 30_000;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: LoadedFighter,
    private readonly opponent: LoadedFighter,
  ) {}

  async init(): Promise<void> {
    if (this.checked) return;
    this.checked = true;
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return;
      const data = (await res.json()) as { commentaryEnabled: boolean };
      this.enabled = data.commentaryEnabled;
    } catch {
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async playIntro(): Promise<void> {
    await this.init();
    if (!this.enabled || this.playing) return;
    await this.speak({
      type: 'intro',
      player: this.botPayload(this.player),
      opponent: this.botPayload(this.opponent),
    });
  }

  update(playerHp: number, enemyHp: number, now: number): void {
    if (!this.enabled || this.playing) return;
    const maxHp = Math.max(
      this.player.stats.maxHealth,
      this.opponent.stats.maxHealth,
    );
    const gap = Math.abs(playerHp - enemyHp);
    if (gap < this.trailGap * maxHp) return;
    if (this.trailingCalled && now - this.lastTrailingAt < this.trailCooldownMs) {
      return;
    }

    const trailingBot =
      playerHp < enemyHp ? this.player.name : this.opponent.name;
    this.trailingCalled = true;
    this.lastTrailingAt = now;

    void this.speak({
      type: 'trailing',
      player: this.botPayload(this.player),
      opponent: this.botPayload(this.opponent),
      trailingBot,
    });
  }

  destroy(): void {
    this.aborted = true;
    this.playing = false;
    this.subtitle?.destroy();
    this.subtitle = undefined;
  }

  private botPayload(f: LoadedFighter) {
    return {
      name: f.name,
      weapon: f.weaponLabel,
      record: f.record,
      strategyNotes: f.strategyNotes,
    };
  }

  private async speak(req: CommentaryRequest): Promise<void> {
    if (this.playing || this.aborted) return;
    this.playing = true;
    try {
      const scriptRes = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!scriptRes.ok || this.aborted) return;
      const { text } = (await scriptRes.json()) as { text: string };
      if (!text || this.aborted) return;

      this.showSubtitle(text);
      if (this.aborted) return;

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!ttsRes.ok || this.aborted) return;

      const blob = await ttsRes.blob();
      if (this.aborted) return;
      const url = URL.createObjectURL(blob);
      await new Promise<void>((resolve) => {
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        void audio.play();
      });
    } catch {
      // commentary is optional
    } finally {
      if (!this.aborted) {
        this.hideSubtitle();
      }
      this.playing = false;
    }
  }

  private showSubtitle(text: string): void {
    if (this.aborted || !this.scene.scene.isActive()) return;
    this.subtitle?.destroy();
    this.subtitle = this.scene.add
      .text(this.scene.scale.width / 2, 48, text, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        fontStyle: '700',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
        align: 'center',
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
  }

  private hideSubtitle(): void {
    this.subtitle?.destroy();
    this.subtitle = undefined;
  }
}
