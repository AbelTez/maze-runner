import { Scene, MeshBuilder, Vector3, Mesh, Color3, StandardMaterial } from "@babylonjs/core";
import { MazeGrid } from "../maze/MazeGrid";
import { Materials } from "./Materials";

export class MazeRenderer {
    private mouseMesh: Mesh | null = null;

  private scene: Scene;

  private maze: MazeGrid;

  private cellSize: number = 2;

  private wallHeight: number = 2;

  private wallThickness: number = 0.1;
  private wallMeshes: Mesh[] = [];

  constructor(scene: Scene, maze: MazeGrid) {
    this.scene = scene;
    this.maze = maze;

    this.createFloor();
}

  render(): void {
    this.clearWalls();

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
    this.wallMeshes.push(wall);
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
    this.wallMeshes.push(wall);
  }
  createMouse(): void {
    this.mouseMesh = MeshBuilder.CreateSphere(
        "mouse",
        {
            diameter: 0.7
        },
        this.scene
    );

    const material = new StandardMaterial(
        "mouseMaterial",
        this.scene
    );

    material.emissiveColor = new Color3(1, 0, 0);

    this.mouseMesh.material = material;
}
updateMousePosition(
    row: number,
    col: number
): void {
    if (!this.mouseMesh) return;

    const x = col * this.cellSize;

    const z = row * this.cellSize;

    this.mouseMesh.position = new Vector3(
        x,
        0.5,
        z
    );
}
  private clearWalls(): void {
    for (const mesh of this.wallMeshes) {
        mesh.dispose();
    }

    this.wallMeshes = [];
}
}
