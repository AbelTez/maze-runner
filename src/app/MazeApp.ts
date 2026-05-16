import { EngineManager } from "../core/Engine";
import { PerformanceManager } from "../core/PerformanceManager";
import { MazeGrid } from "../maze/MazeGrid";
import { DFSGenerator } from "../algorithms/generator/DFSGenerator";
import { DFSSolver } from "../algorithms/solver/DFSSolver";
import { MazeRenderer, type RenderPatch } from "../rendering/MazeRenderer";
import { AnimationScheduler } from "../animation/AnimationScheduler";
import { createDefaultConfig, type AppConfig } from "../config/AppConfig";
import type { QualityPreset } from "../config/GraphicsQuality";
import { UIManager, type AppPhase } from "../ui/UIManager";
import type { OverlayKind } from "../rendering/CellOverlayRenderer.ts";
import { Materials } from "../rendering/Materials";

type RunPhase = "generate" | "solve" | "done";

export class MazeApp {
  private config: AppConfig;
  private engine: EngineManager;
  private performance = new PerformanceManager();
  private maze: MazeGrid;
  private renderer: MazeRenderer;
  private generator: DFSGenerator;
  private solver: DFSSolver | null = null;
  private genScheduler: AnimationScheduler;
  private solveScheduler: AnimationScheduler;
  private ui: UIManager;
  private phase: RunPhase = "generate";
  private autoRunSolve = false;
  private generationStartedAt = 0;
  private solveStartedAt = 0;
  private generationMs = 0;
  private solveMs = 0;

  constructor(canvas: HTMLCanvasElement, quality: QualityPreset = "auto") {
    this.config = createDefaultConfig(quality);
    this.engine = new EngineManager(canvas, this.config.graphics);
    this.maze = new MazeGrid(this.config.mazeRows, this.config.mazeCols);
    this.generator = new DFSGenerator(this.maze);
    this.renderer = new MazeRenderer(
      this.engine.getScene(),
      this.maze,
      this.config,
    );
    this.renderer.createMouse();
    this.renderer.render();
    this.renderer.showEndpoints();

    this.genScheduler = new AnimationScheduler(
      this.config.generationStepsPerSecond,
    );
    this.solveScheduler = new AnimationScheduler(
      this.config.solveStepsPerSecond,
    );

    this.ui = new UIManager({
      onGenerate: () => this.resetAndGenerate(),
      onSolve: () => this.startSolve(),
      onReset: () => this.resetAndGenerate(),
      onPauseToggle: () => this.togglePause(),
      onSpeedChange: (value) => this.setSpeed(value),
      onSizeChange: (size) => this.setMazeSize(size),
      onQualityChange: (preset) => this.setQuality(preset),
      onCameraMode: (mode) => this.setCamera(mode),
    });

    this.engine.frameCameraOnMaze(
      this.maze.rows,
      this.maze.cols,
      this.config.cellSize,
    );
    this.engine.setIsometric();
    this.generationStartedAt = performance.now();

    this.engine.onBeforeRender((deltaSec) => {
      this.tick(deltaSec);
    });
  }

  private tick(deltaSec: number): void {
    const stats = this.performance.tick(this.engine.getSceneMetrics());
    this.ui.setStats({
      ...stats,
      memoryMb: this.performance.estimateMemoryMb(stats.activeMeshes),
      mazeSize: `${this.maze.rows}×${this.maze.cols}`,
      phase: this.getUiPhase(),
      generationMs: this.generationMs,
      solveMs: this.solveMs,
    });

    if (this.phase === "generate") {
      this.tickGeneration(deltaSec);
    } else if (this.phase === "solve" && this.solver) {
      this.tickSolve(deltaSec);
    }

    if (this.phase === "done") {
      const current = this.solver?.getCurrentCell();
      if (current) {
        this.renderer.updateMousePosition(current.row, current.col, deltaSec);
      }
    }
  }

  private tickGeneration(deltaSec: number): void {
    const steps = this.genScheduler.consumeSteps(deltaSec * 1000);
    if (steps === 0) {
      return;
    }

    let patch: RenderPatch | undefined;
    for (let i = 0; i < steps; i++) {
      if (this.generator.completed) {
        break;
      }
      this.generator.step();
      patch = this.mergeRenderPatches(patch, this.buildGenerationPatch());
    }

    if (patch) {
      this.renderer.render(patch);
    }

    const current = this.generator.getCurrentCell();
    if (current) {
      this.renderer.updateMousePosition(current.row, current.col, deltaSec);
    }

    if (this.generator.completed) {
      this.generationMs = performance.now() - this.generationStartedAt;
      this.renderer.showEndpoints();
      if (this.autoRunSolve) {
        this.startSolve();
      } else {
        this.phase = "generated";
      }
    }
  }

  private tickSolve(deltaSec: number): void {
    if (!this.solver) {
      return;
    }

    const steps = this.solveScheduler.consumeSteps(deltaSec * 1000);
    if (steps === 0) {
      return;
    }

    let patch: RenderPatch | undefined;
    for (let i = 0; i < steps; i++) {
      if (this.solver.completed) {
        break;
      }
      this.solver.step();
      patch = this.mergeRenderPatches(patch, this.buildSolvePatch());
    }

    if (patch) {
      this.renderer.render(patch);
    }

    const current = this.solver.getCurrentCell();
    if (current) {
      this.renderer.updateMousePosition(current.row, current.col, deltaSec);
      this.performance.setVisitedCells(this.countSolverVisited());
    }

    if (this.solver.completed) {
      this.solveMs = performance.now() - this.solveStartedAt;
      this.phase = "done";
      this.renderer.highlightSolutionPath();
      this.performance.setPathLength(
        this.solver.getLastDelta().pathCells?.length ?? 0,
      );
    }
  }

  private buildGenerationPatch(): RenderPatch {
    const delta = this.generator.getLastDelta();
    const current = this.generator.getCurrentCell();
    const overlayCells: RenderPatch["overlayCells"] = [];

    if (delta.visitedCell) {
      overlayCells.push({
        ...delta.visitedCell,
        kind: "visited" as OverlayKind,
      });
    }

    return {
      wallCells: delta.wallCells,
      overlayCells,
      activeCell: current ? { row: current.row, col: current.col } : null,
    };
  }

  private buildSolvePatch(): RenderPatch {
    const delta = this.solver!.getLastDelta();
    const current = this.solver!.getCurrentCell();
    const overlayCells: RenderPatch["overlayCells"] = [];

    if (delta.visitedCell) {
      overlayCells.push({ ...delta.visitedCell, kind: "visited" });
    }
    if (delta.deadEndCell) {
      overlayCells.push({ ...delta.deadEndCell, kind: "dead" });
    }
    if (delta.pathCells) {
      for (const cell of delta.pathCells) {
        overlayCells.push({ ...cell, kind: "path" });
      }
    }

    return {
      overlayCells,
      activeCell: current ? { row: current.row, col: current.col } : null,
    };
  }

  private mergeRenderPatches(
    base: RenderPatch | undefined,
    next: RenderPatch,
  ): RenderPatch {
    if (!base) {
      return {
        wallCells: next.wallCells ? [...next.wallCells] : undefined,
        overlayCells: next.overlayCells ? [...next.overlayCells] : undefined,
        activeCell: next.activeCell,
      };
    }

    return {
      wallCells: this.mergeCellLists(base.wallCells, next.wallCells),
      overlayCells: this.mergeOverlayLists(
        base.overlayCells,
        next.overlayCells,
      ),
      activeCell: next.activeCell ?? base.activeCell,
    };
  }

  private mergeCellLists(
    base: Array<{ row: number; col: number }> | undefined,
    next: Array<{ row: number; col: number }> | undefined,
  ): Array<{ row: number; col: number }> | undefined {
    if (!base && !next) {
      return undefined;
    }

    const merged = [...(base ?? [])];
    if (next) {
      for (const cell of next) {
        if (
          !merged.some((item) => item.row === cell.row && item.col === cell.col)
        ) {
          merged.push(cell);
        }
      }
    }

    return merged;
  }

  private mergeOverlayLists(
    base: RenderPatch["overlayCells"],
    next: RenderPatch["overlayCells"],
  ): RenderPatch["overlayCells"] {
    if (!base && !next) {
      return undefined;
    }

    const merged = [...(base ?? [])];
    if (next) {
      for (const cell of next) {
        const existingIndex = merged.findIndex(
          (item) => item.row === cell.row && item.col === cell.col,
        );
        if (existingIndex >= 0) {
          merged[existingIndex] = cell;
        } else {
          merged.push(cell);
        }
      }
    }

    return merged;
  }

  private countSolverVisited(): number {
    let count = 0;
    for (let row = 0; row < this.maze.rows; row++) {
      for (let col = 0; col < this.maze.cols; col++) {
        if (this.maze.cells[row][col].isSolverVisited) {
          count++;
        }
      }
    }
    return count;
  }

  private startSolve(): void {
    if (!this.generator.completed) {
      return;
    }
    this.solver = new DFSSolver(this.maze);
    this.phase = "solve";
    this.solveStartedAt = performance.now();
    this.solveScheduler.reset();
  }

  private resetAndGenerate(): void {
    this.disposeSceneMeshes();
    this.maze = new MazeGrid(this.config.mazeRows, this.config.mazeCols);
    this.generator = new DFSGenerator(this.maze);
    this.solver = null;
    this.phase = "generate";
    this.generationStartedAt = performance.now();
    this.generationMs = 0;
    this.solveMs = 0;
    this.genScheduler.reset();
    this.solveScheduler.reset();

    this.renderer = new MazeRenderer(
      this.engine.getScene(),
      this.maze,
      this.config,
    );
    this.renderer.createMouse();
    this.renderer.render();
    this.renderer.showEndpoints();
    this.engine.frameCameraOnMaze(
      this.maze.rows,
      this.maze.cols,
      this.config.cellSize,
    );
  }

  private disposeSceneMeshes(): void {
    this.renderer.dispose();
    Materials.reset();
  }

  private togglePause(): void {
    const paused = !this.genScheduler.isPaused();
    this.genScheduler.setPaused(paused);
    this.solveScheduler.setPaused(paused);
    this.ui.setPaused(paused);
  }

  private setSpeed(multiplier: number): void {
    const baseGen = this.config.generationStepsPerSecond;
    const baseSolve = this.config.solveStepsPerSecond;
    this.genScheduler.setStepsPerSecond(baseGen * multiplier);
    this.solveScheduler.setStepsPerSecond(baseSolve * multiplier);
  }

  private setMazeSize(size: number): void {
    this.config.mazeRows = size;
    this.config.mazeCols = size;
    this.resetAndGenerate();
  }

  private setQuality(preset: QualityPreset): void {
    this.config.graphics = createDefaultConfig(preset).graphics;
    this.config.generationStepsPerSecond =
      this.config.graphics.animationStepsPerSecond;
    this.resetAndGenerate();
  }

  private setCamera(mode: "top" | "iso"): void {
    if (mode === "top") {
      this.engine.setTopDown();
    } else {
      this.engine.setIsometric();
    }
  }

  private getUiPhase(): AppPhase {
    if (this.phase === "generate" && !this.generator.completed) {
      return "generating";
    }
    if (this.phase === "solve" && this.solver && !this.solver.completed) {
      return "solving";
    }
    if (this.generator.completed && this.solver?.completed) {
      return "complete";
    }
    if (this.generator.completed) {
      return "generated";
    }
    return "idle";
  }
}
