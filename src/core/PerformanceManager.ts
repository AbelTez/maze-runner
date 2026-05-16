export interface PerformanceStats {
  fps: number;
  frameMs: number;
  drawCalls: number;
  activeMeshes: number;
  totalVertices: number;
  visitedCells: number;
  pathLength: number;
}

export class PerformanceManager {
  private frameCount = 0;
  private elapsedMs = 0;
  private fps = 0;
  private frameMs = 0;
  private lastFrameTime = performance.now();

  private visitedCells = 0;
  private pathLength = 0;

  tick(sceneMetrics?: {
    drawCalls: number;
    activeMeshes: number;
    totalVertices: number;
  }): PerformanceStats {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameMs = delta;
    this.frameCount++;
    this.elapsedMs += delta;

    if (this.elapsedMs >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / this.elapsedMs);
      this.frameCount = 0;
      this.elapsedMs = 0;
    }

    return {
      fps: this.fps,
      frameMs: this.frameMs,
      drawCalls: sceneMetrics?.drawCalls ?? 0,
      activeMeshes: sceneMetrics?.activeMeshes ?? 0,
      totalVertices: sceneMetrics?.totalVertices ?? 0,
      visitedCells: this.visitedCells,
      pathLength: this.pathLength,
    };
  }

  setVisitedCells(count: number): void {
    this.visitedCells = count;
  }

  setPathLength(length: number): void {
    this.pathLength = length;
  }

  estimateMemoryMb(activeMeshes: number): number {
    // Rough heuristic: ~2 KB GPU buffers per mesh + JS overhead
    return Math.round((activeMeshes * 2 + 8) / 1024 * 10) / 10;
  }
}
