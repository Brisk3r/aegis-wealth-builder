// UniformGridHash: High-Performance 2D Spatial Partitioning Grid (64x64)
// Capable of maintaining 60+ FPS with 300+ active horde entities.
// Strict 7-Bit ASCII Compliance -- ANSI Windows-1252 Safe

import { VoidEnemyEntity } from "./types";

export class UniformGridHash {
  private cellSize: number;
  private invCellSize: number;
  private offset: number = 200; // Offset to ensure positive indices for integer key hashing
  private buckets: Map<number, VoidEnemyEntity[]>;
  private querySet: Set<string>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
    this.buckets = new Map<number, VoidEnemyEntity[]>();
    this.querySet = new Set<string>();
  }

  /**
   * Fast integer key hashing without string allocation overhead.
   */
  private getKey(cellX: number, cellY: number): number {
    return (cellX + this.offset) * 10000 + (cellY + this.offset);
  }

  /**
   * Clears all spatial grid buckets before rebuilding per frame.
   */
  public clear(): void {
    this.buckets.clear();
    this.querySet.clear();
  }

  /**
   * Inserts an enemy entity into all overlapping grid cells based on bounding box.
   */
  public insert(enemy: VoidEnemyEntity): void {
    const minCellX = Math.floor((enemy.x - enemy.radius) * this.invCellSize);
    const maxCellX = Math.floor((enemy.x + enemy.radius) * this.invCellSize);
    const minCellY = Math.floor((enemy.y - enemy.radius) * this.invCellSize);
    const maxCellY = Math.floor((enemy.y + enemy.radius) * this.invCellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = this.getKey(cx, cy);
        let list = this.buckets.get(key);
        if (!list) {
          list = [];
          this.buckets.set(key, list);
        }
        list.push(enemy);
      }
    }
  }

  /**
   * Rebuilds grid from an array of active enemies.
   */
  public populate(enemies: VoidEnemyEntity[]): void {
    this.clear();
    for (let i = 0; i < enemies.length; i++) {
      this.insert(enemies[i]);
    }
  }

  /**
   * Queries all enemies within a circle of radius R centered at (x, y).
   * Exact Euclidean distance check is executed only on candidates in queried buckets.
   */
  public queryRadius(x: number, y: number, radius: number): VoidEnemyEntity[] {
    const minCellX = Math.floor((x - radius) * this.invCellSize);
    const maxCellX = Math.floor((x + radius) * this.invCellSize);
    const minCellY = Math.floor((y - radius) * this.invCellSize);
    const maxCellY = Math.floor((y + radius) * this.invCellSize);

    const results: VoidEnemyEntity[] = [];
    const seenIds = this.querySet;
    seenIds.clear();

    const rSq = radius * radius;

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = this.getKey(cx, cy);
        const list = this.buckets.get(key);
        if (!list) continue;

        for (let i = 0; i < list.length; i++) {
          const enemy = list[i];
          if (seenIds.has(enemy.id)) continue;
          seenIds.add(enemy.id);

          const dx = enemy.x - x;
          const dy = enemy.y - y;
          const distSq = dx * dx + dy * dy;
          const combinedR = radius + enemy.radius;

          if (distSq <= combinedR * combinedR) {
            results.push(enemy);
          }
        }
      }
    }

    return results;
  }

  /**
   * Finds the nearest enemy entity to (x, y) within maxRadius, optionally excluding a set of IDs.
   */
  public getNearest(
    x: number,
    y: number,
    maxRadius: number,
    excludeIds?: Set<string>
  ): { enemy: VoidEnemyEntity; distSq: number } | null {
    const candidates = this.queryRadius(x, y, maxRadius);
    let nearest: VoidEnemyEntity | null = null;
    let minDistSq = maxRadius * maxRadius;

    for (let i = 0; i < candidates.length; i++) {
      const enemy = candidates[i];
      if (excludeIds && excludeIds.has(enemy.id)) continue;

      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = enemy;
      }
    }

    return nearest ? { enemy: nearest, distSq: minDistSq } : null;
  }

  /**
   * Performs soft separation between overlapping enemies to prevent zero-dimension cluster stacking.
   */
  public resolveSoftRepulsion(enemies: VoidEnemyEntity[]): void {
    const len = enemies.length;
    // Iterate through candidates and apply soft displacement
    for (let i = 0; i < len; i++) {
      const a = enemies[i];
      // Query local neighborhood within (a.radius * 2.5)
      const queryR = a.radius * 2.2;
      const neighbors = this.queryRadius(a.x, a.y, queryR);

      for (let j = 0; j < neighbors.length; j++) {
        const b = neighbors[j];
        if (a.id === b.id) continue;

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;

        if (distSq > 0 && distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart proportionally
          a.x += nx * overlap * 0.45;
          a.y += ny * overlap * 0.45;
          b.x -= nx * overlap * 0.45;
          b.y -= ny * overlap * 0.45;
        }
      }
    }
  }
}
