import { Scene, MeshBuilder, Mesh, Vector3 } from "@babylonjs/core";
import type { MazeGrid } from "../maze/MazeGrid";
import { Materials } from "./Materials";

export type WallDir = "N" | "S" | "E" | "W";

interface WallSlot {
  row: number;
  col: number;
  dir: WallDir;
  mesh: Mesh;
  horizontal: boolean;
}

export class InstancedWallRenderer {
  private scene: Scene;
  private maze: MazeGrid;
  private cellSize: number;
  private wallHeight: number;
  private wallSlots: WallSlot[] = [];
  private slotByKey = new Map<string, number>();
  private tempPosition = new Vector3();

  constructor(
    scene: Scene,
    maze: MazeGrid,
    cellSize: number,
    wallHeight: number,
    wallThickness: number,
  ) {
    this.scene = scene;
    this.maze = maze;
    this.cellSize = cellSize;
    this.wallHeight = wallHeight;

    this.buildWallSlots();
    this.syncAllWalls();
  }

  private buildWallSlots(): void {
    const offsetX = -(this.maze.cols * this.cellSize) / 2 + this.cellSize / 2;
    const offsetZ = -(this.maze.rows * this.cellSize) / 2 + this.cellSize / 2;

    for (let row = 0; row < this.maze.rows; row++) {
      for (let col = 0; col < this.maze.cols; col++) {
        const x = offsetX + col * this.cellSize;
        const z = offsetZ + row * this.cellSize;

        this.createSlot(row, col, "N", true, x, z - this.cellSize / 2);
        this.createSlot(row, col, "W", false, x - this.cellSize / 2, z);

        if (row === this.maze.rows - 1) {
          this.createSlot(row, col, "S", true, x, z + this.cellSize / 2);
        }
        if (col === this.maze.cols - 1) {
          this.createSlot(row, col, "E", false, x + this.cellSize / 2, z);
        }
      }
    }
  }

  private createSlot(
    row: number,
    col: number,
    dir: WallDir,
    horizontal: boolean,
    x: number,
    z: number,
  ): void {
    const mesh = MeshBuilder.CreateBox(
      `wall-${dir}-${row}-${col}`,
      horizontal
        ? { width: this.cellSize, height: this.wallHeight, depth: 0.1 }
        : { width: 0.1, height: this.wallHeight, depth: this.cellSize },
      this.scene,
    );
    mesh.material = Materials.getWallMaterial(this.scene);
    mesh.isPickable = false;
    mesh.position.set(x, this.wallHeight / 2, z);

    const slot: WallSlot = { row, col, dir, mesh, horizontal };
    this.slotByKey.set(`${row},${col},${dir}`, this.wallSlots.length);
    this.wallSlots.push(slot);
  }

  private isWallVisible(row: number, col: number, dir: WallDir): boolean {
    const cell = this.maze.getCell(row, col);
    if (!cell) {
      return false;
    }
    switch (dir) {
      case "N":
        return cell.northWall;
      case "S":
        return cell.southWall;
      case "W":
        return cell.westWall;
      case "E":
        return cell.eastWall;
    }
  }

  private updateSlot(slotIndex: number): void {
    const slot = this.wallSlots[slotIndex];
    slot.mesh.isVisible = this.isWallVisible(slot.row, slot.col, slot.dir);
  }

  syncAllWalls(): void {
    for (let i = 0; i < this.wallSlots.length; i++) {
      this.updateSlot(i);
    }
  }

  updateWallsAt(row: number, col: number): void {
    const dirs: WallDir[] = ["N", "S", "E", "W"];
    for (const dir of dirs) {
      const key = `${row},${col},${dir}`;
      const slotIndex = this.slotByKey.get(key);
      if (slotIndex !== undefined) {
        this.updateSlot(slotIndex);
      }
    }
  }

  updateWallsBetween(
    aRow: number,
    aCol: number,
    bRow: number,
    bCol: number,
  ): void {
    this.updateWallsAt(aRow, aCol);
    this.updateWallsAt(bRow, bCol);
  }

  commitWallUpdates(): void {}

  getMeshes(): Mesh[] {
    return this.wallSlots.map((slot) => slot.mesh);
  }

  dispose(): void {
    for (const slot of this.wallSlots) {
      slot.mesh.dispose();
    }
  }
}
