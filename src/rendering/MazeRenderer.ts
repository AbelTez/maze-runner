import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { MazeGrid } from "../maze/MazeGrid";
import type { Cell } from "../maze/Cell";
import { Materials } from "./Materials";
import { InstancedWallRenderer } from "./InstancedWallRenderer";
import {
  CellOverlayRenderer,
  type OverlayKind,
} from "./CellOverlayRenderer.ts";
import type { AppConfig } from "../config/AppConfig";

export interface RenderPatch {
  wallCells?: Array<{ row: number; col: number }>;
  overlayCells?: Array<{ row: number; col: number; kind: OverlayKind | null }>;
  activeCell?: { row: number; col: number } | null;
}

export class MazeRenderer {
  private scene: Scene;
  private maze: MazeGrid;
  private config: AppConfig;
  private walls: InstancedWallRenderer;
  private overlays: CellOverlayRenderer;
  private mouseMesh: Mesh | null = null;
  private mouseTarget = new Vector3();
  private mouseDisplay = new Vector3();
  private floorMesh: Mesh | null = null;
  private lastActiveCell: { row: number; col: number } | null = null;

  constructor(scene: Scene, maze: MazeGrid, config: AppConfig) {
    this.scene = scene;
    this.maze = maze;
    this.config = config;

    this.createFloor();
    this.walls = new InstancedWallRenderer(
      scene,
      maze,
      config.cellSize,
      config.wallHeight,
      config.wallThickness,
    );
    this.overlays = new CellOverlayRenderer(scene, maze, config.cellSize);
    this.overlays.setEnabledKinds(config.graphics.maxCellOverlays);
    this.showEndpoints();
  }

  createMouse(): void {
    if (this.mouseMesh) {
      return;
    }

    this.mouseMesh = MeshBuilder.CreateSphere(
      "mouse",
      { diameter: 0.65, segments: 12 },
      this.scene,
    );
    this.mouseMesh.material = Materials.getMouseMaterial(this.scene);
    this.mouseMesh.isPickable = false;
  }

  updateMousePosition(row: number, col: number, deltaSec: number): void {
    if (!this.mouseMesh) {
      return;
    }

    const offsetX =
      -(this.maze.cols * this.config.cellSize) / 2 + this.config.cellSize / 2;
    const offsetZ =
      -(this.maze.rows * this.config.cellSize) / 2 + this.config.cellSize / 2;

    this.mouseTarget.x = offsetX + col * this.config.cellSize;
    this.mouseTarget.y = 0.45;
    this.mouseTarget.z = offsetZ + row * this.config.cellSize;

    const t = Math.min(1, deltaSec * this.config.mouseMoveSpeed);
    Vector3.LerpToRef(
      this.mouseMesh.position,
      this.mouseTarget,
      t,
      this.mouseDisplay,
    );
    this.mouseMesh.position.copyFrom(this.mouseDisplay);
  }

  /** Incremental render — only touches changed walls/cells when patch provided. */
  render(patch?: RenderPatch): void {
    if (patch?.wallCells) {
      for (const { row, col } of patch.wallCells) {
        this.walls.updateWallsAt(row, col);
      }
      this.walls.commitWallUpdates();
    }

    if (patch?.overlayCells) {
      for (const { row, col, kind } of patch.overlayCells) {
        if (kind === null) {
          this.clearCellOverlays(row, col);
        } else {
          if (kind === "path") {
            this.overlays.setCell(row, col, "visited", false);
            this.overlays.setCell(row, col, "active", false);
          }
          this.overlays.setCell(row, col, kind, true);
        }
      }
    }

    if (patch?.activeCell) {
      this.syncActiveCell(patch.activeCell.row, patch.activeCell.col);
    }

    if (!patch) {
      this.walls.syncAllWalls();
      this.syncAllOverlays();
    }

    this.overlays.commit();
  }

  syncCellState(cell: Cell): void {
    if (cell.isDeadEnd) {
      this.overlays.setCell(cell.row, cell.col, "dead", true);
    }
    if (cell.isSolutionPath) {
      this.overlays.setCell(cell.row, cell.col, "path", true);
    }
    if (cell.isSolverVisited) {
      this.overlays.setCell(cell.row, cell.col, "visited", true);
    }
    if (cell.visited) {
      this.overlays.setCell(cell.row, cell.col, "visited", true);
    }
  }

  clear(): void {
    this.overlays.clear();
    this.walls.syncAllWalls();
  }

  /** Full solution path highlight after solve completes. */
  highlightSolutionPath(): void {
    for (let row = 0; row < this.maze.rows; row++) {
      for (let col = 0; col < this.maze.cols; col++) {
        const cell = this.maze.cells[row][col];
        if (cell.isSolutionPath) {
          this.overlays.setCell(row, col, "visited", false);
          this.overlays.setCell(row, col, "active", false);
          this.overlays.setCell(row, col, "dead", false);
          this.overlays.setCell(row, col, "path", true);
        }
      }
    }
    this.overlays.commit();
  }

  showEndpoints(): void {
    this.clearCellOverlays(0, 0);
    this.clearCellOverlays(this.maze.rows - 1, this.maze.cols - 1);
    this.overlays.setCell(0, 0, "start", true);
    this.overlays.setCell(this.maze.rows - 1, this.maze.cols - 1, "goal", true);
    this.overlays.commit();
  }

  dispose(): void {
    this.walls.dispose();
    this.overlays.dispose();
    this.floorMesh?.dispose();
    this.mouseMesh?.dispose();
  }

  getDrawMeshes(): Mesh[] {
    const meshes = [...this.walls.getMeshes(), ...this.overlays.getMeshes()];
    if (this.floorMesh) {
      meshes.push(this.floorMesh);
    }
    if (this.mouseMesh) {
      meshes.push(this.mouseMesh);
    }
    return meshes;
  }

  private clearCellOverlays(row: number, col: number): void {
    const kinds: OverlayKind[] = ["visited", "active", "dead", "path"];
    for (const kind of kinds) {
      this.overlays.setCell(row, col, kind, false);
    }
  }

  private syncActiveCell(row: number, col: number): void {
    if (
      this.lastActiveCell &&
      (this.lastActiveCell.row !== row || this.lastActiveCell.col !== col)
    ) {
      this.overlays.setCell(
        this.lastActiveCell.row,
        this.lastActiveCell.col,
        "active",
        false,
      );
    }
    this.overlays.setCell(row, col, "active", true);
    this.lastActiveCell = { row, col };
  }

  private syncAllOverlays(): void {
    for (let row = 0; row < this.maze.rows; row++) {
      for (let col = 0; col < this.maze.cols; col++) {
        this.syncCellState(this.maze.cells[row][col]);
      }
    }
  }

  private createFloor(): void {
    const width = this.maze.cols * this.config.cellSize;
    const height = this.maze.rows * this.config.cellSize;

    this.floorMesh = MeshBuilder.CreateGround(
      "mazeGround",
      { width, height },
      this.scene,
    );
    this.floorMesh.material = Materials.getFloorMaterial(this.scene);
    this.floorMesh.receiveShadows = false;
    this.floorMesh.freezeWorldMatrix();
  }
}
