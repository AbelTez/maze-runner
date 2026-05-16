import { MazeGrid } from "../../maze/MazeGrid";
import { Cell } from "../../maze/Cell";
import { Stack } from "../../utils/Stack";

export class DFSGenerator {
  private maze: MazeGrid;
  private stack: Stack<Cell> = new Stack<Cell>();

  constructor(maze: MazeGrid) {
    this.maze = maze;
  }

  generate(): void {
    const startCell = this.maze.getCell(0, 0);
    if (!startCell) return;
    startCell.visited = true;
    this.stack.push(startCell);

    while (!this.stack.isEmpty()) {
      const currentCell = this.stack.peek();
      if (!currentCell) break;
      const neighbors = this.getUnvisitedNeighbors(currentCell);

      if (neighbors.length === 0) {
        this.stack.pop();
        continue;
      }
      const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.removeWall(currentCell, nextCell);
      nextCell.visited = true;
      this.stack.push(nextCell);
    }
  }

  private getUnvisitedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    const directions = [
      { row: cell.row - 1, col: cell.col }, // North
      { row: cell.row + 1, col: cell.col }, // South
      { row: cell.row, col: cell.col + 1 }, // East
      { row: cell.row, col: cell.col - 1 }, // West
    ];
    for (const { row, col } of directions) {
      const neighbor = this.maze.getCell(row, col);
      if (neighbor && !neighbor.visited) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }
  private removeWall(current: Cell, next: Cell): void {
    const rowDifference = current.row - next.row;

    const colDifference = current.col - next.col;
    //the next is above
    if (rowDifference === 1) {
      current.northWall = false;
      next.southWall = false;
    }
    //the next is below
    else if (rowDifference === -1) {
      current.southWall = false;
      next.northWall = false;
    }
    //the next is to the right
    else if (colDifference === -1) {
      current.eastWall = false;
      next.westWall = false;
    }
    //the next is to the left
    else if (colDifference === 1) {
      current.westWall = false;
      next.eastWall = false;
    }
  }
}
