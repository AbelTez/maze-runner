import "./styles/style.css";

import { EngineManager } from "./core/Engine";

import { MazeGrid } from "./maze/MazeGrid";

import { DFSGenerator } from "./algorithms/generator/DFSGenerator";

import { MazeRenderer } from "./rendering/MazeRenderer";

const canvas = document.createElement("canvas");

canvas.id = "renderCanvas";

document.body.appendChild(canvas);

const engine = new EngineManager(canvas);

const maze = new MazeGrid(10, 10);

const generator = new DFSGenerator(maze);

generator.generate();

const renderer = new MazeRenderer(
    engine.getScene(),
    maze
);

renderer.render();