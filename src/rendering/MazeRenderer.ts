import { Scene, MeshBuilder, Vector3 } from "@babylonjs/core";

import { MazeGrid } from "../maze/MazeGrid";
import { Materials } from "./Materials";

export class MazeRenderer {
  private scene: Scene;

  private maze: MazeGrid;

  private cellSize: number = 2;

  private wallHeight: number = 2;

  private wallThickness: number = 0.1;

  constructor(scene: Scene, maze: MazeGrid) {
    this.scene = scene;
    this.maze = maze;
  }

  render(): void {
    this.createFloor();

    this.renderWalls();
  }

  private createFloor(): void {
    const width = this.maze.cols * this.cellSize;

    const height = this.maze.rows * this.cellSize;

    const ground = MeshBuilder.CreateGround(
      "mazeGround",
      {
        width,
        height,
      },
      this.scene,
    );

    ground.material = Materials.createFloorMaterial(this.scene);
  }

  private renderWalls(): void {
    const offsetX = -(this.maze.cols * this.cellSize) / 2 + this.cellSize / 2;
    const offsetZ = -(this.maze.rows * this.cellSize) / 2 + this.cellSize / 2;

    for (let row = 0; row < this.maze.rows; row++) {
      for (let col = 0; col < this.maze.cols; col++) {
        const cell = this.maze.cells[row][col];

        const x = offsetX + col * this.cellSize;
        const z = offsetZ + row * this.cellSize;

        // NORTH WALL
        if (cell.northWall) {
          this.createHorizontalWall(x, z - this.cellSize / 2);
        }

        // WEST WALL
        if (cell.westWall) {
          this.createVerticalWall(x - this.cellSize / 2, z);
        }

        // LAST ROW SOUTH WALL
        if (row === this.maze.rows - 1 && cell.southWall) {
          this.createHorizontalWall(x, z + this.cellSize / 2);
        }

        // LAST COLUMN EAST WALL
        if (col === this.maze.cols - 1 && cell.eastWall) {
          this.createVerticalWall(x + this.cellSize / 2, z);
        }
      }
    }
  }

  private createHorizontalWall(x: number, z: number): void {
    const wall = MeshBuilder.CreateBox(
      "horizontalWall",
      {
        width: this.cellSize,
        height: this.wallHeight,
        depth: this.wallThickness,
      },
      this.scene,
    );

    wall.position = new Vector3(x, this.wallHeight / 2, z);

    wall.material = Materials.createWallMaterial(this.scene);
  }

  private createVerticalWall(x: number, z: number): void {
    const wall = MeshBuilder.CreateBox(
      "verticalWall",
      {
        width: this.wallThickness,
        height: this.wallHeight,
        depth: this.cellSize,
      },
      this.scene,
    );

    wall.position = new Vector3(x, this.wallHeight / 2, z);

    wall.material = Materials.createWallMaterial(this.scene);
  }
}
