import { MazeGrid } from "../maze/MazeGrid";

export class MazeDebugger {
    static printVisited(maze: MazeGrid): void {
        for (let row = 0; row < maze.rows; row++) {
            let line = "";

            for (let col = 0; col < maze.cols; col++) {
                line += maze.cells[row][col].visited
                    ? " V "
                    : " X ";
            }

            console.log(line);
        }
    }
}