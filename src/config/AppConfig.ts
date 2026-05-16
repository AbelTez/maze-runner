import type { GraphicsSettings } from "./GraphicsQuality";
import { resolveGraphicsSettings, type QualityPreset } from "./GraphicsQuality";

export interface AppConfig {
  mazeRows: number;
  mazeCols: number;
  cellSize: number;
  wallHeight: number;
  wallThickness: number;
  generationStepsPerSecond: number;
  solveStepsPerSecond: number;
  mouseMoveSpeed: number;
  graphics: GraphicsSettings;
}

export function createDefaultConfig(
  quality: QualityPreset = "auto",
): AppConfig {
  const graphics = resolveGraphicsSettings(quality);

  return {
    mazeRows: 20,
    mazeCols: 20,
    cellSize: 2,
    wallHeight: 1,
    wallThickness: 0.1,
    generationStepsPerSecond: graphics.animationStepsPerSecond,
    solveStepsPerSecond: Math.floor(graphics.animationStepsPerSecond * 0.75),
    mouseMoveSpeed: 8,
    graphics,
  };
}
