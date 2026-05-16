import type { QualityPreset } from "../config/GraphicsQuality";

export type AppPhase =
  | "idle"
  | "generating"
  | "generated"
  | "solving"
  | "complete";

export interface UiStats {
  fps: number;
  frameMs: number;
  drawCalls: number;
  activeMeshes: number;
  totalVertices: number;
  visitedCells: number;
  pathLength: number;
  memoryMb: number;
  mazeSize: string;
  phase: AppPhase;
  generationMs: number;
  solveMs: number;
}

export interface UiCallbacks {
  onGenerate: () => void;
  onSolve: () => void;
  onReset: () => void;
  onPauseToggle: () => void;
  onSpeedChange: (multiplier: number) => void;
  onSizeChange: (size: number) => void;
  onQualityChange: (preset: QualityPreset) => void;
  onCameraMode: (mode: "top" | "iso") => void;
}

export class UIManager {
  private root: HTMLElement;
  private statsEl: HTMLElement;
  private callbacks: UiCallbacks;

  constructor(callbacks: UiCallbacks) {
    this.callbacks = callbacks;
    this.root = document.createElement("div");
    this.root.id = "hud";
    this.root.innerHTML = `
      <div class="hud-panel">
        <h1>Maze Runner</h1>
        <div class="row">
          <button id="btn-generate" type="button">Generate</button>
          <button id="btn-solve" type="button">Solve</button>
          <button id="btn-reset" type="button">Reset</button>
          <button id="btn-pause" type="button">Pause</button>
        </div>
        <label class="row">Speed <input id="speed" type="range" min="0.25" max="3" step="0.25" value="1" /></label>
        <label class="row">Size
          <select id="size">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20" selected>20</option>
            <option value="30">30</option>
            <option value="40">40</option>
          </select>
        </label>
        <label class="row">Quality
          <select id="quality">
            <option value="auto" selected>Auto</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label class="row">Camera
          <select id="camera">
            <option value="iso" selected>Isometric</option>
            <option value="top">Top-down</option>
          </select>
        </label>
        <div id="stats" class="stats"></div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.statsEl = this.root.querySelector("#stats")!;

    this.bind();
  }

  private bind(): void {
    this.root.querySelector("#btn-generate")!.addEventListener("click", () =>
      this.callbacks.onGenerate(),
    );
    this.root.querySelector("#btn-solve")!.addEventListener("click", () =>
      this.callbacks.onSolve(),
    );
    this.root.querySelector("#btn-reset")!.addEventListener("click", () =>
      this.callbacks.onReset(),
    );
    this.root.querySelector("#btn-pause")!.addEventListener("click", () =>
      this.callbacks.onPauseToggle(),
    );

    this.root.querySelector("#speed")!.addEventListener("input", (e) => {
      const value = Number((e.target as HTMLInputElement).value);
      this.callbacks.onSpeedChange(value);
    });

    this.root.querySelector("#size")!.addEventListener("change", (e) => {
      const value = Number((e.target as HTMLSelectElement).value);
      this.callbacks.onSizeChange(value);
    });

    this.root.querySelector("#quality")!.addEventListener("change", (e) => {
      this.callbacks.onQualityChange(
        (e.target as HTMLSelectElement).value as QualityPreset,
      );
    });

    this.root.querySelector("#camera")!.addEventListener("change", (e) => {
      this.callbacks.onCameraMode(
        (e.target as HTMLSelectElement).value as "top" | "iso",
      );
    });
  }

  setPaused(paused: boolean): void {
    const btn = this.root.querySelector("#btn-pause") as HTMLButtonElement;
    btn.textContent = paused ? "Resume" : "Pause";
  }

  setStats(stats: UiStats): void {
    this.statsEl.innerHTML = `
      <div><strong>Phase</strong> ${stats.phase}</div>
      <div><strong>FPS</strong> ${stats.fps} (${stats.frameMs.toFixed(1)} ms)</div>
      <div><strong>Draw calls</strong> ${stats.drawCalls}</div>
      <div><strong>Meshes</strong> ${stats.activeMeshes}</div>
      <div><strong>Vertices</strong> ${stats.totalVertices}</div>
      <div><strong>Memory ~</strong> ${stats.memoryMb} MB</div>
      <div><strong>Maze</strong> ${stats.mazeSize}</div>
      <div><strong>Gen time</strong> ${(stats.generationMs / 1000).toFixed(2)}s</div>
      <div><strong>Solve time</strong> ${(stats.solveMs / 1000).toFixed(2)}s</div>
      <div><strong>Visited</strong> ${stats.visitedCells}</div>
      <div><strong>Path</strong> ${stats.pathLength}</div>
    `;
  }
}
