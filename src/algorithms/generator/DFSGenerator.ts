import { MazeGrid } from "../../maze/MazeGrid";
import { Cell } from "../../maze/Cell";
import { Stack } from "../../utils/Stack";


export interface GenerationStepDelta {
    wallCells: Array<{ row: number; col: number }>;
    visitedCell: { row: number; col: number } | null;
}

export class DFSGenerator {
    private maze: MazeGrid;

    private stack: Stack<Cell> = new Stack();

    private currentCell: Cell | null = null;

    public completed: boolean = false;

    private lastDelta: GenerationStepDelta = {
        wallCells: [],
        visitedCell: null,
    };

    constructor(maze: MazeGrid) {
        this.maze = maze;

        const startCell = this.maze.getCell(0, 0);

        if (!startCell) return;

        startCell.visited = true;

        this.stack.push(startCell);

        this.currentCell = startCell;
    }

    step(): void {
        this.lastDelta = { wallCells: [], visitedCell: null };

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

        const neighbors =
            this.getUnvisitedNeighbors(current);

        if (neighbors.length === 0) {
            this.stack.pop();
            return;
        }

        const next =
            neighbors[
                Math.floor(Math.random() * neighbors.length)
            ];

        this.removeWalls(current, next);

        next.visited = true;

        this.stack.push(next);

        this.lastDelta = {
            wallCells: [
                { row: current.row, col: current.col },
                { row: next.row, col: next.col },
            ],
            visitedCell: { row: next.row, col: next.col },
        };
    }

    getCurrentCell(): Cell | null {
        return this.currentCell;
    }

    getLastDelta(): GenerationStepDelta {
        return this.lastDelta;
    }

    private getUnvisitedNeighbors(
        cell: Cell
    ): Cell[] {
        const neighbors: Cell[] = [];

        const directions = [
            [cell.row - 1, cell.col],
            [cell.row + 1, cell.col],
            [cell.row, cell.col - 1],
            [cell.row, cell.col + 1]
        ];

        for (const [row, col] of directions) {
            const neighbor = this.maze.getCell(row, col);

            if (neighbor && !neighbor.visited) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    private removeWalls(
        current: Cell,
        next: Cell
    ): void {
        const rowDifference =
            current.row - next.row;

        const colDifference =
            current.col - next.col;

        if (rowDifference === 1) {
            current.northWall = false;
            next.southWall = false;
        }

        else if (rowDifference === -1) {
            current.southWall = false;
            next.northWall = false;
        }

        else if (colDifference === 1) {
            current.westWall = false;
            next.eastWall = false;
        }

        else if (colDifference === -1) {
            current.eastWall = false;
            next.westWall = false;
        }
    }
}