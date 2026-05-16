import {Cell} from "./Cell";

export class MazeGrid{
    rows:number;
    cols:number
    cells:Cell[][]=[];
    
    constructor(rows:number,cols:number){
        this.rows=rows;
        this.cols=cols;
        this.initializerGrid();
    }
    private initializerGrid(): void {
        for (let row =0 ; row < this.rows; row++){
            const currentRow: Cell[] = [];
            for (let col = 0 ; col < this.cols; col++){
                currentRow.push(new Cell(row,col));
            }
            this.cells.push(currentRow);
        }
    }
    getCell(row:number,col:number): Cell | null {
        if(row < 0 || row >= this.rows || col < 0 || col >= this.cols){
            return null;
        }
        return this.cells[row][col];
    }

}