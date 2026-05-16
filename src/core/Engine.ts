import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import type { GraphicsSettings } from "../config/GraphicsQuality";

export class EngineManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera;
  private lastFrameTime = performance.now();

  constructor(canvas: HTMLCanvasElement, graphics: GraphicsSettings) {
    this.canvas = canvas;

    this.engine = new Engine(canvas, graphics.antialias, {
      adaptToDeviceRatio: true,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
      stencil: false,
      antialias: graphics.antialias,
    });

    if (graphics.hardwareScaling > 1) {
      this.engine.setHardwareScalingLevel(graphics.hardwareScaling);
    }

    this.scene = this.createScene(graphics);
    this.camera = this.scene.activeCamera as ArcRotateCamera;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  private createScene(graphics: GraphicsSettings): Scene {
    const scene = new Scene(this.engine);
    scene.clearColor = new Color4(0.04, 0.05, 0.08, 1);
    scene.autoClear = true;
    scene.blockMaterialDirtyMechanism = true;

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.6,
      42,
      Vector3.Zero(),
      scene,
    );
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 120;
    camera.wheelPrecision = 0.4;
    camera.attachControl(this.canvas, true);
    scene.activeCamera = camera;

    const light = new HemisphericLight(
      "light",
      new Vector3(0.2, 1, 0.1),
      scene,
    );
    light.intensity = 0.95;
    light.groundColor = new Color3(0.08, 0.08, 0.1);

    if (graphics.fogEnabled) {
      scene.fogMode = Scene.FOGMODE_EXP2;
      scene.fogDensity = 0.012;
      scene.fogColor = new Color3(0.04, 0.05, 0.08);
    }

    return scene;
  }

  onBeforeRender(callback: (deltaSec: number) => void): void {
    this.scene.onBeforeRenderObservable.add(() => {
      const now = performance.now();
      const deltaSec = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      callback(deltaSec);
    });
  }

  getScene(): Scene {
    return this.scene;
  }

  getEngine(): Engine {
    return this.engine;
  }

  getCamera(): ArcRotateCamera {
    return this.camera;
  }

  setTopDown(): void {
    this.camera.alpha = -Math.PI / 2;
    this.camera.beta = 0.12;
  }

  setIsometric(): void {
    this.camera.alpha = -Math.PI / 4;
    this.camera.beta = Math.PI / 3.2;
  }

  frameCameraOnMaze(rows: number, cols: number, cellSize: number): void {
    const cx = 0;
    const cz = 0;
    const span = Math.max(rows, cols) * cellSize;
    this.camera.setTarget(new Vector3(cx, 0, cz));
    this.camera.radius = span * 1.15;
  }

  getSceneMetrics(): {
    drawCalls: number;
    activeMeshes: number;
    totalVertices: number;
  } {
    const engine = this.scene.getEngine();
    return {
      drawCalls: (engine as Engine & { _drawCalls?: number })._drawCalls ?? 0,
      activeMeshes: this.scene.getActiveMeshes().length,
      totalVertices: this.scene.getTotalVertices(),
    };
  }
}
