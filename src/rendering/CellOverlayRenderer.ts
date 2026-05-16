import { Scene, MeshBuilder, Mesh } from "@babylonjs/core";
import type { MazeGrid } from "../maze/MazeGrid";
import { Materials } from "./Materials";

export type OverlayKind =
  | "visited"
  | "active"
  | "dead"
  | "path"
  | "start"
  | "goal";

interface LayerState {
  mesh: Mesh;
  cellMeshes: Map<string, Mesh>;
}

export class CellOverlayRenderer {
  private layers = new Map<OverlayKind, LayerState>();
  private cellSize: number;
  private offsetX: number;
  private offsetZ: number;

  constructor(scene: Scene, maze: MazeGrid, cellSize: number) {
    this.cellSize = cellSize;
    this.offsetX = -(maze.cols * cellSize) / 2 + cellSize / 2;
    this.offsetZ = -(maze.rows * cellSize) / 2 + cellSize / 2;

    const kinds: OverlayKind[] = [
      "visited",
      "active",
      "dead",
      "path",
      "start",
      "goal",
    ];
    for (const kind of kinds) {
      this.layers.set(kind, this.createLayer(scene, kind));
    }
  }

  private createLayer(scene: Scene, kind: OverlayKind): LayerState {
    const height = kind === "path" ? 0.16 : 0.07;
    const mesh = MeshBuilder.CreateBox(
      `overlay-${kind}`,
      { width: this.cellSize * 0.9, height, depth: this.cellSize * 0.9 },
      scene,
    );
    mesh.material = Materials.getOverlayMaterial(scene, kind);
    mesh.isPickable = false;
    mesh.isVisible = false;

    return {
      mesh,
      cellMeshes: new Map(),
    };
  }

  setEnabledKinds(_maxKinds: number): void {
    for (const layer of this.layers.values()) {
      layer.mesh.setEnabled(true);
    }
  }

  setCell(row: number, col: number, kind: OverlayKind, visible: boolean): void {
    const layer = this.layers.get(kind);
    if (!layer || !layer.mesh.isEnabled()) {
      return;
    }

    const key = `${row},${col}`;
    let mesh = layer.cellMeshes.get(key);

    if (!visible) {
      if (mesh) {
        mesh.isVisible = false;
      }
      return;
    }

    if (!mesh) {
      mesh = this.createCellMesh(layer.mesh.getScene(), kind, row, col);
      layer.cellMeshes.set(key, mesh);
    }

    mesh.isVisible = true;
    mesh.position.set(
      this.offsetX + col * this.cellSize,
      kind === "path"
        ? 0.14
        : kind === "start" || kind === "goal"
          ? 0.12
          : kind === "active"
            ? 0.1
            : 0.07,
      this.offsetZ + row * this.cellSize,
    );
  }

  commit(): void {
    // No GPU buffer updates needed for mesh-based overlays.
  }

  clear(): void {
    for (const layer of this.layers.values()) {
      for (const mesh of layer.cellMeshes.values()) {
        mesh.dispose();
      }
      layer.cellMeshes.clear();
    }
  }

  getMeshes(): Mesh[] {
    return [...this.layers.values()].map((layer) => layer.mesh);
  }

  dispose(): void {
    for (const layer of this.layers.values()) {
      for (const mesh of layer.cellMeshes.values()) {
        mesh.dispose();
      }
      layer.mesh.dispose();
    }
    this.layers.clear();
  }

  private createCellMesh(
    scene: Scene,
    kind: OverlayKind,
    row: number,
    col: number,
  ): Mesh {
    const height = kind === "path" ? 0.16 : 0.07;
    const mesh = MeshBuilder.CreateBox(
      `overlay-cell-${kind}-${row}-${col}`,
      { width: this.cellSize * 0.9, height, depth: this.cellSize * 0.9 },
      scene,
    );
    mesh.material = Materials.getOverlayMaterial(scene, kind);
    mesh.isPickable = false;
    return mesh;
  }
}
