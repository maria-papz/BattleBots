# BattleBots Pro League — Data-Driven Arena

A browser-based robot combat game built for the **BattleBots Hack Night powered by Bright Data**. You pick two real Pro League competitors, fight in a top-down arena, and every stat — speed, damage, weapon type, AI strategy — comes from scraped season data. An optional GPT + ElevenLabs commentator narrates the match like a TV announcer.

Built with **Phaser 3**, **TypeScript**, **Vite**, **Bright Data** (web scraping), **OpenAI** (commentary scripts), and **ElevenLabs** (voice).

---

## Table of contents

1. [What this project does](#what-this-project-does)
2. [Architecture overview](#architecture-overview)
3. [The data layer](#the-data-layer)
4. [All 24 Pro League robots](#all-24-pro-league-robots)
5. [How data becomes gameplay](#how-data-becomes-gameplay)
6. [Game flow](#game-flow)
7. [Controls](#controls)
8. [Combat and stats](#combat-and-stats)
9. [Opponent AI](#opponent-ai)
10. [Weapon animations](#weapon-animations)
11. [Commentator system](#commentator-system)
12. [Getting started](#getting-started)
13. [Environment variables](#environment-variables)
14. [npm scripts](#npm-scripts)
15. [Project structure](#project-structure)
16. [Demo script for judges](#demo-script-for-judges)
17. [Hackathon submission](#hackathon-submission)

---

## What this project does

This is a **software/data hack**, not a hardware project. The goal is to:

1. **Scrape** BattleBots Pro League fight records, standings, and robot info from the web using **Bright Data**.
2. **Transform** that data into structured per-bot profiles (stats, weapon class, strategy).
3. **Play** a Phaser arena game where both your robot and the AI opponent use those real profiles.
4. **Optionally narrate** the fight with GPT-written lines spoken by ElevenLabs.

The game features all **24 robots** from the inaugural BattleBots Pro League season (6 groups of 4). Mirror matches (same bot vs itself) are blocked.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  OFFLINE (before you play)                                      │
│                                                                 │
│  Bright Data Web Unlocker  ──►  scripts/build-bot-profiles.mjs  │
│  battlebots.com / Wiki              │                             │
│                                   ▼                             │
│                         data/bot-profiles.json                  │
│                         public/data/bot-profiles.json           │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (Phaser game)                                          │
│                                                                 │
│  BootScene ──► load profiles ──► SelectScene (pick 2 bots)     │
│                                       │                         │
│                                       ▼                         │
│                                  ArenaScene                     │
│                                  ├─ PlayerRobot (you)           │
│                                  ├─ EnemyRobot (AI)             │
│                                  ├─ WeaponBehavior              │
│                                  ├─ StrategyAI                  │
│                                  ├─ Weapon animations           │
│                                  └─ Commentator (optional)        │
│                                       │                         │
│                              R key ───┘ (back to SelectScene)   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (only if commentary enabled)
┌─────────────────────────────────────────────────────────────────┐
│  LOCAL API (server/index.mjs on port 8787)                      │
│                                                                 │
│  POST /api/commentary  ──►  OpenAI (Faruq-style script)       │
│  POST /api/tts         ──►  ElevenLabs (spoken audio)           │
│  GET  /api/health      ──►  { commentaryEnabled: true/false } │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

- API keys never ship to the browser. Commentary runs through a local Node server.
- Profile data is **pre-synced** to JSON before play (fast, reliable for demos).
- If `bot-profiles.json` is missing, the game falls back to hardcoded stats in `roster.ts`.
- Commentary is fully disabled when env keys are absent — no errors, no broken UI.

---

## The data layer

### Sources

| Source | URL | What we use it for |
|--------|-----|-------------------|
| BattleBots Wiki | `battlebots.fandom.com/wiki/BattleBots_Pro_League` | Group standings, W-L records, weapon types |
| BattleBots.com | `battlebots.com/proleague/` | Official Pro League pages |
| Roster fallback | `src/game/data/roster.ts` | Base stats when scrape is unavailable |

### Bright Data integration

Bright Data's **Web Unlocker** fetches pages that may block normal HTTP clients. The sync script (`scripts/build-bot-profiles.mjs`) calls:

```
POST https://api.brightdata.com/request
Authorization: Bearer <BRIGHTDATA_API_TOKEN>
Body: { zone, url, format: "raw" }
```

Sign up at [brightdata.com](https://brightdata.com). Hackathon attendees can use promo code **`hackersquad100`** for $100 credit.

### Bot profile schema

Each of the 24 robots gets a `BotProfile` entry in `public/data/bot-profiles.json`:

```json
{
  "id": "tombstone",
  "name": "Tombstone",
  "weaponClass": "horizontal_spinner",
  "weaponLabel": "HORIZONTAL BAR SPINNER",
  "moveSpeed": 163,
  "reverseSpeed": 108,
  "rotationSpeed": 165,
  "attackDamage": 17,
  "attackRange": 80,
  "attackArc": 65,
  "attackCooldown": 700,
  "knockbackForce": 290,
  "maxHealth": 90,
  "bodyRadius": 22,
  "strategy": "aggressive_rusher",
  "strategyNotes": "Commits early, chases down opponents with sustained weapon pressure.",
  "winRate": 0,
  "record": "0-1",
  "sources": ["https://battlebots.fandom.com/wiki/BattleBots_Pro_League"]
}
```

| Field | Purpose |
|-------|---------|
| `weaponClass` | Drives attack animation style (spinner spin, flipper arc, etc.) |
| `moveSpeed` / `attackDamage` / etc. | Directly mapped to in-game `RobotStats` |
| `strategy` | Tunes opponent AI behavior (rush, counter, hit-and-run…) |
| `strategyNotes` | Shown on select screen; fed to GPT for commentary |
| `record` / `winRate` | Pro League group-stage results; winners get slight stat bonus |

### Building profiles

```bash
cp .env.example .env        # add BRIGHTDATA_API_TOKEN
npm run build:profiles      # writes data/ + public/data/bot-profiles.json
```

The script:
1. Reads base stats from `roster.ts` for all 24 bots.
2. Optionally fetches wiki pages via Bright Data.
3. Applies Pro League standings (W-L) and weapon-type → strategy mapping.
4. Slight win-rate stat scaling for bots on winning records.
5. Writes JSON to both `data/` and `public/data/` (Vite serves `public/`).

Validate roster completeness:

```bash
npm run check:roster   # must print "All 24 Pro League bots are in the roster."
```

### Loading profiles in the game

`src/game/data/loadBotProfiles.ts` runs at boot:

1. `fetch('/data/bot-profiles.json')`
2. Builds a `Map<id, BotProfile>`
3. On failure → `buildFallbackProfiles()` from `roster.ts`

Profiles are stored in the Phaser registry as `botProfiles` and merged into fighters via `mergeProfileIntoFighter()`, producing a `LoadedFighter` with stats + strategy + weapon class.

---

## All 24 Pro League robots

Six groups of four. One group winner advances to the knockout finals.

| Group | Robots |
|-------|--------|
| **A** | Manta, Terrortops, Skorpios, Valkyrie |
| **B** | Disarray, MadCatter, Magnitude, Tombstone |
| **C** | Copperhead, The Twins, Cobalt, Jackpot |
| **D** | Death Roll, End Game, Malice, Golden Fury |
| **E** | Bloodsport, HUGE, HyperShock, Minotaur |
| **F** | Witch Doctor, Switchback, Ribbot, Orbitron |

Canonical list: `src/game/data/proLeague.ts`  
Playable definitions (art, colors, base stats): `src/game/data/roster.ts`

**Art note:** 17 bots have custom SVG/programmatic art. Seven newer additions (Tombstone, Terrortops, Skorpios, Valkyrie, Switchback, Witch Doctor, The Twins) use placeholder textures generated at runtime in `src/game/art/placeholderBots.ts`. They are fully playable.

---

## How data becomes gameplay

```
bot-profiles.json
       │
       ▼
  BotProfile (per robot)
       │
       ├──► RobotStats ──────► move speed, damage, HP, range, cooldown
       │
       ├──► WeaponClass ─────► attack animation (spin, flip, drum pulse…)
       │
       └──► StrategyStyle ───► AI tuning (rush distance, retreat threshold…)
```

Example: **Tombstone**
- Data: `horizontal_spinner`, `aggressive_rusher`, high `attackDamage`, low `maxHealth`
- Game: fast bar-spinner weapon animation, AI commits attacks early and creeps forward

Example: **Switchback**
- Data: `flipper`, `box_rush`, high `knockbackForce`
- Game: upward arc flip animation, AI box-rushes and flips aggressively

---

## Game flow

### Scene pipeline

```
BootScene → SelectScene → ArenaScene
```

### BootScene
- Preloads SVG robot assets.
- Generates Phaser textures (arena floor, robots, HUD icons).
- Fetches `bot-profiles.json` with a "Loading league data…" message.
- Stores profiles in registry, starts SelectScene.

### SelectScene (two-step wizard)

**Step 1 — Choose your fighter**
- Browse all 24 robots with **← / →** or by clicking thumbnails.
- The roster uses a **two-row layout** so names and icons don’t overlap.
- The featured card shows portrait, weapon, strategy notes, record, and DMG / SPD / HP with clear spacing.

**Step 2 — Choose opponent**
- Same UI; your pick is shown at the top (`YOU: …`).
- Your robot is excluded from the opponent list (no mirror matches).
- Press **Backspace** to go back to step 1.

Confirm → arena.

### ArenaScene
- **READY** countdown (1 second), then **FIGHT!**
- 3-minute match timer.
- Win by KO (HP → 0) or higher HP when timer expires.
- **R** returns to fighter select after win/loss — you can pick a new matchup and play again without refreshing.
- **ESC** pauses.

---

## Controls

| Key | Action |
|-----|--------|
| **W / S** | Drive forward / reverse |
| **A / D** | Rotate left / right |
| **Space** | Attack (when weapon is ready) |
| **← / →** | Cycle fighters on select screen |
| **Enter** | Confirm selection |
| **Backspace** | Back to player pick (opponent step) |
| **Esc** | Pause / resume |
| **R** | Return to fighter select (after win/loss) |

Click the featured card, chevrons, or thumb icons on the select screen to pick fighters.

---

## Combat and stats

Each robot has these combat properties (from `RobotStats` in `src/game/types/game.ts`):

| Stat | Effect |
|------|--------|
| `maxHealth` | Hit points |
| `moveSpeed` | Forward top speed |
| `reverseSpeed` | Reverse speed |
| `rotationSpeed` | Turn rate (deg/sec) |
| `attackDamage` | Damage per successful hit |
| `attackRange` | How far the weapon reaches |
| `attackArc` | Cone width for hits (degrees) |
| `attackCooldown` | Milliseconds between attacks |
| `knockbackForce` | Push on hit |
| `bodyRadius` | Collision circle size |

Combat logic lives in `src/game/systems/CombatSystem.ts` and `src/game/systems/WeaponBehavior.ts`:
- Attacker must face target within `attackArc` (horizontal spinners use a full 360° arc).
- Target must be within `attackRange`.
- Cooldown must be elapsed.
- Hits apply damage + knockback + screen shake + SFX.

**Weapon-specific behavior** (`WeaponBehavior.ts`):

| Weapon class | Special effect |
|--------------|----------------|
| `horizontal_spinner` | Slightly lower damage, higher knockback |
| `vertical_spinner` | Bonus damage on precision head-on hits |
| `undercutter` | Big bonus on rear/side hits |
| `drum` | High damage + knockback |
| `flipper` | Strong knockback + launch |
| `saw` | Double damage + grind when target is near arena walls |
| `dual_spinner` | Two hit ticks per swing |
| `multibot` | Dual offset hit checks per swing |

On-screen callouts show effects like **LAUNCHED**, **GRINDING**, **UNDERCUT**, and **CLEAN HIT**.

The HUD (`src/game/ui/BattleHud.ts`) shows both fighters' names, icons, HP bars, weapon/attack meters, and match timer.

---

## Opponent AI

The opponent is always **AI-controlled**, tuned from scraped strategy data. There is no separate "easy/hard" mode — behavior comes from each bot's `strategy` field.

`StrategyAI` maps strategy → `EnemyAI` config:

| Strategy | Behavior |
|----------|----------|
| `aggressive_rusher` | Enters attack range sooner, shorter reposition cooldown, more forward creep |
| `box_rush` | Fast chase, commits attacks earlier (flippers) |
| `counter_attacker` | Holds mid-range, punishes approach |
| `control_grinder` | Longer reposition, sustained pressure (saws) |
| `hit_and_run` | Attacks then retreats quickly (undercutters) |
| `defensive` | Larger retreat range, backs off when low HP |

The underlying FSM (`EnemyAI.ts`) has three states:
- **CHASE** — rotate toward player, drive forward
- **ATTACK** — face target, fire when in arc and range
- **REPOSITION** — reverse and spin away when stuck or too close

Low-HP retreat threshold is also strategy-dependent.

---

## Weapon animations

`weaponClass` from the profile drives distinct attack visuals in `src/game/systems/weaponAnimation.ts`:

| Weapon class | Animation |
|--------------|-----------|
| `horizontal_spinner`, `vertical_spinner`, `undercutter` | Weapon marker spins 360° |
| `drum` | Scale pulse + lunge |
| `flipper` | Upward arc tween |
| `saw` | Oscillating sweep |
| `dual_spinner`, `multibot` | Wide flash, larger scale |

SFX variants in `src/game/audio/Sfx.ts` — flippers get a low thump, drums a heavy burst, spinners the classic whoosh.

---

## Commentator system

Optional. Fully off unless all three are true:
- `ENABLE_COMMENTARY=true`
- `OPENAI_API_KEY` is set
- `ELEVENLABS_API_KEY` is set

### How it works

1. **ArenaScene** creates a `Commentator` instance.
2. On init, client calls `GET /api/health` — if disabled, commentator no-ops silently.
3. When fight goes **LIVE**: GPT writes a 1–2 sentence intro (Faruq Tauheed style) → ElevenLabs speaks it.
4. During match: if health gap ≥ 25% of max HP, GPT writes a "keep up" line for the trailing bot → spoken once (30s cooldown).

Subtitles appear at the top of the screen while audio plays.

### Running the API

Terminal 1:
```bash
npm run dev:api
```

Terminal 2:
```bash
npm run dev
```

Vite proxies `/api/*` → `http://localhost:8787` (see `vite.config.ts`).

Or both at once:
```bash
npm run dev:full
```

### API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | `{ commentaryEnabled: boolean }` |
| `/api/commentary` | POST | Body: `{ type, player, opponent, trailingBot? }` → `{ text }` |
| `/api/tts` | POST | Body: `{ text }` → `audio/mpeg` |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone <your-repo>
cd BattleBots
npm install
cp .env.example .env
```

### Configure `.env`

Minimum for the game alone: nothing required (uses bundled `bot-profiles.json`).

For live data refresh:
```
BRIGHTDATA_API_TOKEN=your_token
```

For commentary:
```
ENABLE_COMMENTARY=true
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=optional_voice_id
```

### Run

```bash
npm run build:profiles   # optional: refresh bot data
npm run dev              # game at http://localhost:5173
```

With commentary:
```bash
npm run dev:api          # terminal 1
npm run dev              # terminal 2
```

### Production build

```bash
npm run build
npm run preview
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BRIGHTDATA_API_TOKEN` | For live scrape | Bright Data API token |
| `BRIGHTDATA_WEB_UNLOCKER_ZONE` | No | Default: `mcp_unlocker` |
| `BATTLEBOTS_WIKI_URL` | No | Wiki page to scrape |
| `BATTLEBOTS_PRO_LEAGUE_URL` | No | Official Pro League URL |
| `ENABLE_COMMENTARY` | No | `true` to enable announcer |
| `OPENAI_API_KEY` | For commentary | GPT script generation |
| `OPENAI_MODEL` | No | Default: `gpt-4o-mini` |
| `ELEVENLABS_API_KEY` | For commentary | Text-to-speech |
| `ELEVENLABS_VOICE_ID` | No | Voice ID (default provided) |
| `COMMENTARY_TRAIL_GAP` | No | HP gap fraction for trailing callout (default `0.25`) |
| `API_PORT` | No | Local API port (default `8787`) |

Never commit `.env`. It is listed in `.gitignore`.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (game) |
| `npm run dev:api` | Start commentary API server |
| `npm run dev:full` | Start API + game together |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build |
| `npm run build:profiles` | Generate `bot-profiles.json` from roster + Bright Data |
| `npm run sync:data` | Legacy coarse league snapshot script |
| `npm run check:roster` | Assert all 24 Pro League bots exist in roster |

---

## Project structure

```
BattleBots/
├── public/
│   ├── data/
│   │   └── bot-profiles.json      # Served to browser at /data/bot-profiles.json
│   └── robots/                    # SVG top-down robot art
├── data/
│   └── bot-profiles.json          # Source copy of profile data
├── scripts/
│   ├── build-bot-profiles.mjs     # Main data pipeline
│   ├── sync-pro-league.mjs        # Coarse Bright Data snapshot
│   └── check-roster.mjs           # Validates 24-bot roster
├── server/
│   └── index.mjs                  # GPT + ElevenLabs API (keys stay server-side)
├── src/
│   ├── main.ts                    # Phaser boot entry
│   ├── game/
│   │   ├── config.ts              # Phaser game config
│   │   ├── constants.ts           # Arena size, colors, texture keys
│   │   ├── data/
│   │   │   ├── roster.ts          # 24 fighters: art, colors, base stats
│   │   │   ├── proLeague.ts       # Canonical 24-bot league list + groups
│   │   │   ├── botProfile.ts      # BotProfile type + weapon class mapping
│   │   │   └── loadBotProfiles.ts # Fetch/merge profiles into LoadedFighter
│   │   ├── scenes/
│   │   │   ├── BootScene.ts       # Load textures + profiles
│   │   │   ├── SelectScene.ts     # Two-step fighter picker
│   │   │   └── ArenaScene.ts      # Match gameplay
│   │   ├── entities/
│   │   │   ├── Robot.ts           # Base robot physics + weapon visuals
│   │   │   ├── PlayerRobot.ts     # Keyboard input
│   │   │   └── EnemyRobot.ts      # AI-controlled opponent
│   │   ├── systems/
│   │   │   ├── CombatSystem.ts    # Hit detection + damage
│   │   │   ├── WeaponBehavior.ts  # Per-weapon damage, launch, grind, multi-hit
│   │   │   ├── EnemyAI.ts         # Chase/attack/reposition FSM
│   │   │   ├── StrategyAI.ts      # Strategy → AI config mapping
│   │   │   ├── weaponAnimation.ts # Per-weapon-class attack FX
│   │   │   └── Commentator.ts     # Client-side announcer orchestration
│   │   ├── ui/
│   │   │   └── BattleHud.ts       # HP, timer, fighter cards
│   │   ├── audio/
│   │   │   └── Sfx.ts             # Procedural Web Audio SFX
│   │   └── art/                   # Texture generators per robot
│   └── styles/
│       └── main.css
├── .env.example
├── vite.config.ts                 # Dev server + /api proxy
└── package.json
```

---

## Demo script for judges

1. **Show the data pipeline**
   ```bash
   npm run build:profiles
   ```
   Open `public/data/bot-profiles.json` — point out real W-L records, weapon classes, strategies.

2. **Start the game**
   ```bash
   npm run dev:api & npm run dev
   ```

3. **Pick a matchup** — e.g. Bloodsport vs Tombstone. Show the two-row roster and profile card: strategy, record, scraped stats.

4. **Fight** — note both robots use their real art and data-driven stats. Tombstone hits harder; AI rushes aggressively. Point out weapon effects (flipper launch, saw grind near walls).

5. **Commentary** (if enabled) — intro at FIGHT, trailing callout when one bot falls behind.

6. **Play again** — press **R** after the match, pick new fighters, and start another round without refreshing.

7. **Emphasize Bright Data** — "We scraped Pro League standings via Bright Data Web Unlocker and mapped them directly into gameplay stats, AI, and animations."

---

## Hackathon submission

Submit to both:

- **[HackerSquad.io](https://hackersquad.io)** — London hack night judging
- **[brightdata.com/lp/battlebots](https://brightdata.com/lp/battlebots)** — Global #battlebotsdev hack (Vegas VIP prize, deadline 31 July)

Bright Data signup promo code for attendees: **`hackersquad100`**

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Game engine | Phaser 3.87 |
| Language | TypeScript 5.7 |
| Bundler | Vite 6 |
| Web data | Bright Data Web Unlocker API |
| Commentary LLM | OpenAI GPT-4o-mini |
| Voice | ElevenLabs TTS |
| Physics | Phaser Arcade (top-down, no gravity) |

---

## License

Private hackathon project. BattleBots is a trademark of BattleBots Inc.
