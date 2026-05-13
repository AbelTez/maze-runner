import "./styles/style.css";

import { EngineManager } from "./core/Engine";

const canvas = document.createElement("canvas");

canvas.id = "renderCanvas";

document.body.appendChild(canvas);

new EngineManager(canvas);