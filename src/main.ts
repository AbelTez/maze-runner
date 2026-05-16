import "./styles/style.css";

import { EngineManager } from "./core/Engine";

import { MazeGrid } from "./maze/MazeGrid";
import { DFSGenerator } from "./algorithms/generator/DFSGenerator";
import { MazeDebugger } from "./utils/MazeDebugger";

const canvas = document.createElement("canvas");

canvas.id = "renderCanvas";

document.body.appendChild(canvas);

new EngineManager(canvas);
const maze = new MazeGrid(5, 5);

const generator = new DFSGenerator(maze);

generator.generate();

console.log(maze);

MazeDebugger.printVisited(maze);