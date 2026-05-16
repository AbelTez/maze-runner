import "./styles/style.css";

import { EngineManager } from "./core/Engine";

import { MazeGrid } from "./maze/MazeGrid";

import { DFSGenerator } from "./algorithms/generator/DFSGenerator";

import { MazeRenderer } from "./rendering/MazeRenderer";

import { Animator } from "./animation/Animator";

const canvas = document.createElement("canvas");

canvas.id = "renderCanvas";

document.body.appendChild(canvas);

const engine = new EngineManager(canvas);

const maze = new MazeGrid(20, 20);

const generator = new DFSGenerator(maze);

const renderer = new MazeRenderer(
    engine.getScene(),
    maze
);

renderer.createMouse();

const animator = new Animator(30);

engine.getScene().onBeforeRenderObservable.add(() => {

    if (
        !generator.completed &&
        animator.shouldUpdate()
    ) {
        generator.step();

        renderer.render();

        const current =
            generator.getCurrentCell();

        if (current) {
            renderer.updateMousePosition(
                current.row,
                current.col
            );
        }
    }
});