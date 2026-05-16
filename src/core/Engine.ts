import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
} from "@babylonjs/core";
import { MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

export class EngineManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.engine = new Engine(this.canvas, true);

    this.scene = this.createScene();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private createScene(): Scene {
    const scene = new Scene(this.engine);

    // Camera
    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3,
      40,
      new Vector3(5, 0, 5),
      scene,
    );

    camera.attachControl(this.canvas, true);

    // Light
    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // Ground
    const ground = MeshBuilder.CreateGround(
      "ground",
      {
        width: 20,
        height: 20,
      },
      scene,
    );

    const groundMaterial = new StandardMaterial("groundMaterial", scene);

    groundMaterial.diffuseColor = new Color3(0.15, 0.15, 0.15);

    ground.material = groundMaterial;

    return scene;
  }
  public getScene(): Scene {
    return this.scene;
  }
}
