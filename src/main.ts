import "./styles/style.css";
import { MazeApp } from "./app/MazeApp";

const canvas = document.createElement("canvas");
canvas.id = "renderCanvas";
document.body.appendChild(canvas);

new MazeApp(canvas, "auto");
