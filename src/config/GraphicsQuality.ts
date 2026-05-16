export type QualityPreset = "low" | "medium" | "high" | "auto";

export interface GraphicsSettings {
  preset: QualityPreset;
  antialias: boolean;
  hardwareScaling: number;
  shadowsEnabled: boolean;
  fogEnabled: boolean;
  glowEnabled: boolean;
  maxCellOverlays: number;
  animationStepsPerSecond: number;
}

const PRESETS: Record<Exclude<QualityPreset, "auto">, GraphicsSettings> = {
  low: {
    preset: "low",
    antialias: false,
    hardwareScaling: 1.5,
    shadowsEnabled: false,
    fogEnabled: false,
    glowEnabled: false,
    maxCellOverlays: 4,
    animationStepsPerSecond: 25,
  },
  medium: {
    preset: "medium",
    antialias: false,
    hardwareScaling: 1,
    shadowsEnabled: false,
    fogEnabled: false,
    glowEnabled: false,
    maxCellOverlays: 4,
    animationStepsPerSecond: 40,
  },
  high: {
    preset: "high",
    antialias: true,
    hardwareScaling: 1,
    shadowsEnabled: true,
    fogEnabled: true,
    glowEnabled: true,
    maxCellOverlays: 4,
    animationStepsPerSecond: 60,
  },
};

export function resolveGraphicsSettings(
  preset: QualityPreset,
): GraphicsSettings {
  if (preset !== "auto") {
    return { ...PRESETS[preset] };
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const isLowEnd =
    cores <= 4 || (memory !== undefined && memory <= 4);

  return { ...PRESETS[isLowEnd ? "low" : "medium"], preset: "auto" };
}
