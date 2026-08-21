// Enemy Spawner & Horde Wave Director for Void Survivors (Nova Protocol)
// Directs 360-degree perimeter wave spawning, elite boss encounters,
// enemy projectile physics, and XP gem drop & consolidation solvers.
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

import {
  EnemyProjectile,
  EnemyType,
  GemType,
  VoidEnemyEntity,
  VoidPlayerState,
  XPGemEntity,
} from "./types";
import { voidSound } from "./audioSynth";

export class HordeWaveDirector {
  private nextEntityId: number = 1;
  private spawnTimer: number = 0;
  private spawnInterval: number = 1.0; // Base seconds between cluster spawns
  private bossBehemothSpawned: boolean = false;
  private bossColossusSpawned: boolean = false;

  public activeBossName: string | null = null;
  public activeBossHpRatio: number = 0;

  /**
   * Resets spawner state for a fresh run.
   */
  public reset(): void {
    this.nextEntityId = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
    this.bossBehemothSpawned = false;
    this.bossColossusSpawned = false;
    this.activeBossName = null;
    this.activeBossHpRatio = 0;
  }

  /**
   * Updates wave timer, spawns perimeter clusters, updates enemy AI and projectiles.
   */
  public update(
    dt: number,
    elapsedSeconds: number,
    player: VoidPlayerState,
    enemies: VoidEnemyEntity[],
    enemyProjectiles: EnemyProjectile[],
    onBossSpawn?: (bossName: string) => void
  ): void {
    // Difficulty curve based on elapsed time (0s to 300s+)
    const timeRatio = Math.min(4.0, 1.0 + (elapsedSeconds / 60) * 0.45);
    this.spawnInterval = Math.max(0.35, 1.2 / timeRatio);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWaveCluster(elapsedSeconds, player, enemies);
    }

    // Boss Trigger 1: Void Behemoth at 120s (2:00)
    if (elapsedSeconds >= 120 && !this.bossBehemothSpawned) {
      this.bossBehemothSpawned = true;
      this.spawnBossBehemoth(player, enemies);
      voidSound.playBossAlarm();
      if (onBossSpawn) onBossSpawn("VOID BEHEMOTH");
    }

    // Boss Trigger 2: Singularity Colossus at 240s (4:00)
    if (elapsedSeconds >= 240 && !this.bossColossusSpawned) {
      this.bossColossusSpawned = true;
      this.spawnBossColossus(player, enemies);
      voidSound.playBossAlarm();
      if (onBossSpawn) onBossSpawn("SINGULARITY COLOSSUS");
    }

    // Track active boss HP for top HUD display
    let activeBoss: VoidEnemyEntity | null = null;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].isBoss && enemies[i].hp > 0) {
        activeBoss = enemies[i];
        break;
      }
    }
    if (activeBoss) {
      this.activeBossName = activeBoss.type === "VOID_BEHEMOTH" ? "VOID BEHEMOTH" : "SINGULARITY COLOSSUS";
      this.activeBossHpRatio = Math.max(0, Math.min(1, activeBoss.hp / activeBoss.maxHp));
    } else {
      this.activeBossName = null;
      this.activeBossHpRatio = 0;
    }

    // Update Enemy AI, movement towards player, attacks, and projectile logic
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.iframeTimer > 0) {
        e.iframeTimer = Math.max(0, e.iframeTimer - dt);
      }

      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dist > 0 ? dx / dist : 0;
      const ny = dist > 0 ? dy / dist : 0;

      e.angle = Math.atan2(dy, dx);

      // Enemy specific AI behavior
      switch (e.type) {
        case "MITE": {
          // Direct relentless swarm chase
          e.vx = nx * e.speed;
          e.vy = ny * e.speed;
          break;
        }

        case "STALKER": {
          // Fast tracking with slight orbital angle
          const perpX = -ny * 0.2;
          const perpY = nx * 0.2;
          e.vx = (nx + perpX) * e.speed;
          e.vy = (ny + perpY) * e.speed;
          break;
        }

        case "SPITTER": {
          // Maintains ~240px standoff distance and fires plasma bolts
          if (dist < 220) {
            e.vx = -nx * e.speed * 0.8;
            e.vy = -ny * e.speed * 0.8;
          } else if (dist > 280) {
            e.vx = nx * e.speed;
            e.vy = ny * e.speed;
          } else {
            e.vx *= 0.85;
            e.vy *= 0.85;
          }

          e.shootTimer += dt;
          if (e.shootTimer >= 2.2 && dist < 450) {
            e.shootTimer = 0;
            // Fire plasma projectile towards player
            const projSpeed = 190;
            enemyProjectiles.push({
              id: "eproj_" + (this.nextEntityId++),
              x: e.x,
              y: e.y,
              vx: nx * projSpeed,
              vy: ny * projSpeed,
              radius: 5,
              damage: 18,
              color: "#FF9900",
              life: 0,
              maxLife: 3.5,
            });
          }
          break;
        }

        case "GOLIATH": {
          // Heavy steady advance
          e.vx = nx * e.speed;
          e.vy = ny * e.speed;
          break;
        }

        case "VOID_BEHEMOTH": {
          // Boss 1: Slow advance + 12-way bullet spirals
          e.vx = nx * e.speed;
          e.vy = ny * e.speed;
          e.shootTimer += dt;

          if (e.shootTimer >= 2.0) {
            e.shootTimer = 0;
            const bulletCount = 12;
            const baseAngle = e.angle;
            const projSpeed = 150;

            for (let b = 0; b < bulletCount; b++) {
              const bAngle = baseAngle + (b * Math.PI * 2) / bulletCount;
              enemyProjectiles.push({
                id: "boss_b_" + (this.nextEntityId++),
                x: e.x,
                y: e.y,
                vx: Math.cos(bAngle) * projSpeed,
                vy: Math.sin(bAngle) * projSpeed,
                radius: 6,
                damage: 24,
                color: "#FFE600",
                life: 0,
                maxLife: 4.0,
              });
            }
          }
          break;
        }

        case "SINGULARITY_COLOSSUS": {
          // Boss 2: Gravity aura + expanding plasma nova
          e.vx = nx * e.speed;
          e.vy = ny * e.speed;
          e.shootTimer += dt;

          // Pull player gently if within 300px
          if (dist < 320 && dist > 50) {
            const pullForce = 22 * (1 - dist / 320);
            player.vx -= nx * pullForce * dt;
            player.vy -= ny * pullForce * dt;
          }

          if (e.shootTimer >= 2.4) {
            e.shootTimer = 0;
            const spiralWaves = 16;
            const projSpeed = 160;

            for (let s = 0; s < spiralWaves; s++) {
              const sAngle = (s * Math.PI * 2) / spiralWaves + (elapsedSeconds * 2.0);
              enemyProjectiles.push({
                id: "boss_col_" + (this.nextEntityId++),
                x: e.x,
                y: e.y,
                vx: Math.cos(sAngle) * projSpeed,
                vy: Math.sin(sAngle) * projSpeed,
                radius: 7,
                damage: 32,
                color: "#BF00FF",
                life: 0,
                maxLife: 4.5,
              });
            }
          }
          break;
        }
      }

      // Step position
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    }

    // Update Enemy Projectiles
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
      const p = enemyProjectiles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.life >= p.maxLife) {
        enemyProjectiles.splice(i, 1);
      }
    }
  }

  /**
   * Spawns a cluster of enemies along a perimeter ring 550px from player.
   */
  private spawnWaveCluster(
    elapsedSeconds: number,
    player: VoidPlayerState,
    enemies: VoidEnemyEntity[]
  ): void {
    if (enemies.length >= 260) return; // Cap maximum active enemies for 60 FPS safety

    const spawnRadius = 560;
    const centerAngle = Math.random() * Math.PI * 2;
    const clusterSpread = 0.6; // radians
    const diffFactor = 1.0 + (elapsedSeconds / 60) * 0.35;

    // Determine enemy composition based on timeline
    let count = 4 + Math.floor(Math.random() * 4) + Math.floor(elapsedSeconds / 45);
    count = Math.min(14, count);

    for (let i = 0; i < count; i++) {
      const angle = centerAngle + (Math.random() - 0.5) * clusterSpread;
      const x = player.x + Math.cos(angle) * (spawnRadius + (Math.random() - 0.5) * 60);
      const y = player.y + Math.sin(angle) * (spawnRadius + (Math.random() - 0.5) * 60);

      const roll = Math.random();
      let type: EnemyType = "MITE";

      if (elapsedSeconds < 45) {
        type = "MITE";
      } else if (elapsedSeconds < 90) {
        type = roll < 0.65 ? "MITE" : "STALKER";
      } else if (elapsedSeconds < 160) {
        if (roll < 0.45) type = "MITE";
        else if (roll < 0.8) type = "STALKER";
        else type = "SPITTER";
      } else {
        if (roll < 0.35) type = "MITE";
        else if (roll < 0.65) type = "STALKER";
        else if (roll < 0.85) type = "SPITTER";
        else type = "GOLIATH";
      }

      const enemy = this.createEnemy(type, x, y, diffFactor);
      enemies.push(enemy);
    }
  }

  private createEnemy(type: EnemyType, x: number, y: number, diffFactor: number): VoidEnemyEntity {
    const id = "e_" + (this.nextEntityId++);

    switch (type) {
      case "MITE":
        return {
          id,
          type: "MITE",
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 10,
          hp: Math.round(18 * diffFactor),
          maxHp: Math.round(18 * diffFactor),
          speed: 135,
          damage: 12,
          xpValue: 10,
          shardsValue: Math.random() < 0.05 ? 1 : 0,
          color: "#00F0FF",
          iframeTimer: 0,
          shootTimer: 0,
          angle: 0,
        };

      case "STALKER":
        return {
          id,
          type: "STALKER",
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 13,
          hp: Math.round(65 * diffFactor),
          maxHp: Math.round(65 * diffFactor),
          speed: 110,
          damage: 22,
          xpValue: 25,
          shardsValue: Math.random() < 0.15 ? 1 : 0,
          color: "#BF00FF",
          iframeTimer: 0,
          shootTimer: 0,
          angle: 0,
        };

      case "SPITTER":
        return {
          id,
          type: "SPITTER",
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 16,
          hp: Math.round(120 * diffFactor),
          maxHp: Math.round(120 * diffFactor),
          speed: 85,
          damage: 20,
          xpValue: 45,
          shardsValue: Math.random() < 0.25 ? 2 : 0,
          color: "#FF9900",
          iframeTimer: 0,
          shootTimer: Math.random() * 1.5,
          angle: 0,
        };

      case "GOLIATH":
        return {
          id,
          type: "GOLIATH",
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 22,
          hp: Math.round(380 * diffFactor),
          maxHp: Math.round(380 * diffFactor),
          speed: 62,
          damage: 42,
          xpValue: 100,
          shardsValue: 3 + Math.floor(Math.random() * 3),
          color: "#FF3366",
          iframeTimer: 0,
          shootTimer: 0,
          angle: 0,
        };

      default:
        return {
          id,
          type: "MITE",
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 10,
          hp: 20,
          maxHp: 20,
          speed: 130,
          damage: 10,
          xpValue: 10,
          shardsValue: 0,
          color: "#00F0FF",
          iframeTimer: 0,
          shootTimer: 0,
          angle: 0,
        };
    }
  }

  private spawnBossBehemoth(player: VoidPlayerState, enemies: VoidEnemyEntity[]): void {
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * 500;
    const y = player.y + Math.sin(angle) * 500;

    enemies.push({
      id: "boss_behemoth_" + (this.nextEntityId++),
      type: "VOID_BEHEMOTH",
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 36,
      hp: 2500,
      maxHp: 2500,
      speed: 72,
      damage: 50,
      xpValue: 750,
      shardsValue: 40,
      color: "#FFE600",
      iframeTimer: 0,
      shootTimer: 0,
      angle: 0,
      isBoss: true,
      bossPhase: 1,
    });
  }

  private spawnBossColossus(player: VoidPlayerState, enemies: VoidEnemyEntity[]): void {
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * 520;
    const y = player.y + Math.sin(angle) * 520;

    enemies.push({
      id: "boss_colossus_" + (this.nextEntityId++),
      type: "SINGULARITY_COLOSSUS",
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 48,
      hp: 6000,
      maxHp: 6000,
      speed: 52,
      damage: 70,
      xpValue: 1800,
      shardsValue: 100,
      color: "#BF00FF",
      iframeTimer: 0,
      shootTimer: 0,
      angle: 0,
      isBoss: true,
      bossPhase: 1,
    });
  }

  /**
   * Spawns an XP gem on enemy defeat with scatter velocity.
   */
  public dropGemForEnemy(enemy: VoidEnemyEntity, xpGems: XPGemEntity[]): void {
    const scatterSpeed = 3.5;
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * (Math.random() * scatterSpeed);
    const vy = Math.sin(angle) * (Math.random() * scatterSpeed);

    let gemType: GemType = "GREEN";
    let color = "#39FF14";
    let radius = 4.5;
    const val = enemy.xpValue;

    if (val >= 500) {
      gemType = "CORE_GOLD";
      color = "#FFD700";
      radius = 8.5;
    } else if (val >= 80) {
      gemType = "VIOLET";
      color = "#BF00FF";
      radius = 6.5;
    } else if (val >= 25) {
      gemType = "BLUE";
      color = "#00F0FF";
      radius = 5.5;
    }

    xpGems.push({
      id: "gem_" + (this.nextEntityId++),
      type: gemType,
      x: enemy.x,
      y: enemy.y,
      vx,
      vy,
      value: val,
      color,
      radius,
      isAttracted: false,
      pursuitTimer: 0,
    });
  }

  /**
   * Consolidates overflow gems (>140) into high-density Core Gems to protect framerate.
   */
  public consolidateGems(player: VoidPlayerState, xpGems: XPGemEntity[]): void {
    if (xpGems.length < 140) return;

    // Filter distant gems (> 350px from player)
    const distantGems: { gem: XPGemEntity; index: number }[] = [];
    for (let i = 0; i < xpGems.length; i++) {
      const g = xpGems[i];
      if (g.isAttracted) continue;
      const dx = g.x - player.x;
      const dy = g.y - player.y;
      if (dx * dx + dy * dy > 350 * 350) {
        distantGems.push({ gem: g, index: i });
      }
    }

    if (distantGems.length < 6) return;

    // Take first 6 distant gems, sum their values, and replace with single CORE_GOLD gem
    let sumValue = 0;
    let avgX = 0;
    let avgY = 0;
    const indicesToRemove: number[] = [];

    const mergeCount = Math.min(10, distantGems.length);
    for (let i = 0; i < mergeCount; i++) {
      const item = distantGems[i];
      sumValue += item.gem.value;
      avgX += item.gem.x;
      avgY += item.gem.y;
      indicesToRemove.push(item.index);
    }

    avgX /= mergeCount;
    avgY /= mergeCount;

    // Sort descending to safely splice
    indicesToRemove.sort((a, b) => b - a);
    for (let i = 0; i < indicesToRemove.length; i++) {
      xpGems.splice(indicesToRemove[i], 1);
    }

    // Insert consolidated gem
    xpGems.push({
      id: "gem_core_" + (this.nextEntityId++),
      type: "CORE_GOLD",
      x: avgX,
      y: avgY,
      vx: 0,
      vy: 0,
      value: sumValue,
      color: "#FFD700",
      radius: 8.5,
      isAttracted: false,
      pursuitTimer: 0,
    });
  }
}
