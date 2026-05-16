export class Cell {
  row: number;
  col: number;
  visited: boolean = false;

  northWall: boolean = true;
  southWall: boolean = true;
  eastWall: boolean = true;
  westWall: boolean = true;
  isSolverVisited: boolean = false;

  isDeadEnd: boolean = false;

  isSolutionPath: boolean = false;
  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}
