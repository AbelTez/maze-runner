import { MazeGrid } from "../../maze/MazeGrid";
import { Cell } from "../../maze/Cell";
import { Stack } from "../../utils/Stack";

export interface SolverStepDelta {
    visitedCell: { row: number; col: number } | null;
    deadEndCell: { row: number; col: number } | null;
    pathCells: Array<{ row: number; col: number }> | null;
}

export class DFSSolver {
    private maze: MazeGrid;

    private stack: Stack<Cell> = new Stack();

    private currentCell: Cell | null = null;

    public completed: boolean = false;

    private goal: Cell;

    private lastDelta: SolverStepDelta = {
        visitedCell: null,
        deadEndCell: null,
        pathCells: null,
    };

    constructor(maze: MazeGrid) {
        this.maze = maze;

        const start = this.maze.getCell(0, 0);

        const goal = this.maze.getCell(
            maze.rows - 1,
            maze.cols - 1
        );

        if (!start || !goal) {
            throw new Error("Invalid maze");
        }

        this.goal = goal;

        start.isSolverVisited = true;

        this.stack.push(start);

        this.currentCell = start;
    }

    step(): void {
        this.lastDelta = {
            visitedCell: null,
            deadEndCell: null,
            pathCells: null,
        };

        if (this.stack.isEmpty()) {
            this.completed = true;
            return;
        }

        const current = this.stack.peek();

        if (!current) {
            this.completed = true;
            return;
        }

        this.currentCell = current;

        if (current === this.goal) {
            this.markSolutionPath();
            this.lastDelta.pathCells = [];
            this.stack.forEach((cell) => {
                this.lastDelta.pathCells!.push({
                    row: cell.row,
                    col: cell.col,
                });
            });
            this.completed = true;
            return;
        }

        const neighbors =
            this.getAvailableNeighbors(current);

        if (neighbors.length === 0) {
            current.isDeadEnd = true;
            this.lastDelta.deadEndCell = {
                row: current.row,
                col: current.col,
            };
            this.stack.pop();
            return;
        }

        const next =
            neighbors[
                Math.floor(Math.random() * neighbors.length)
            ];

        next.isSolverVisited = true;
        this.stack.push(next);
        this.lastDelta.visitedCell = { row: next.row, col: next.col };
    }

    getCurrentCell(): Cell | null {
        return this.currentCell;
    }

    getLastDelta(): SolverStepDelta {
        return this.lastDelta;
    }

    private getAvailableNeighbors(
        cell: Cell
    ): Cell[] {

        const neighbors: Cell[] = [];

        const row = cell.row;
        const col = cell.col;

        // NORTH
        const north =
            this.maze.getCell(row - 1, col);

        if (
            north &&
            !cell.northWall &&
            !north.isSolverVisited
        ) {
            neighbors.push(north);
        }

        // SOUTH
        const south =
            this.maze.getCell(row + 1, col);

        if (
            south &&
            !cell.southWall &&
            !south.isSolverVisited
        ) {
            neighbors.push(south);
        }

        // WEST
        const west =
            this.maze.getCell(row, col - 1);

        if (
            west &&
            !cell.westWall &&
            !west.isSolverVisited
        ) {
            neighbors.push(west);
        }

        // EAST
        const east =
            this.maze.getCell(row, col + 1);

        if (
            east &&
            !cell.eastWall &&
            !east.isSolverVisited
        ) {
            neighbors.push(east);
        }

        return neighbors;
    }

    private markSolutionPath(): void {
        this.stack.forEach((cell) => {
            cell.isSolutionPath = true;
        });
    }
}