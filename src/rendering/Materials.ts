import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { OverlayKind } from "./CellOverlayRenderer.ts";

export class Materials {
  private static wallMaterial: StandardMaterial | null = null;
  private static floorMaterial: StandardMaterial | null = null;
  private static mouseMaterial: StandardMaterial | null = null;
  private static overlayMaterials = new Map<OverlayKind, StandardMaterial>();

  static reset(): void {
    this.wallMaterial?.dispose();
    this.floorMaterial?.dispose();
    this.mouseMaterial?.dispose();
    for (const mat of this.overlayMaterials.values()) {
      mat.dispose();
    }
    this.wallMaterial = null;
    this.floorMaterial = null;
    this.mouseMaterial = null;
    this.overlayMaterials.clear();
  }

  static getWallMaterial(scene: Scene): StandardMaterial {
    if (!this.wallMaterial) {
      this.wallMaterial = new StandardMaterial("wallMaterial", scene);
      this.wallMaterial.diffuseColor = new Color3(0.92, 0.93, 0.96);
      this.wallMaterial.emissiveColor = new Color3(0.08, 0.08, 0.1);
      this.wallMaterial.specularColor = Color3.Black();
      this.wallMaterial.freeze();
    }
    return this.wallMaterial;
  }

  static getFloorMaterial(scene: Scene): StandardMaterial {
    if (!this.floorMaterial) {
      this.floorMaterial = new StandardMaterial("floorMaterial", scene);
      this.floorMaterial.diffuseColor = new Color3(0.12, 0.12, 0.14);
      this.floorMaterial.specularColor = Color3.Black();
      this.floorMaterial.freeze();
    }
    return this.floorMaterial;
  }

  static getMouseMaterial(scene: Scene): StandardMaterial {
    if (!this.mouseMaterial) {
      this.mouseMaterial = new StandardMaterial("mouseMaterial", scene);
      this.mouseMaterial.emissiveColor = new Color3(1, 0.15, 0.1);
      this.mouseMaterial.specularColor = Color3.Black();
      this.mouseMaterial.freeze();
    }
    return this.mouseMaterial;
  }

  static getOverlayMaterial(scene: Scene, kind: OverlayKind): StandardMaterial {
    let mat = this.overlayMaterials.get(kind);
    if (mat) {
      return mat;
    }

    const colors: Record<OverlayKind, Color3> = {
      visited: new Color3(0.2, 0.45, 0.9),
      active: new Color3(1, 0.85, 0.2),
      dead: new Color3(0.35, 0.35, 0.95),
      path: new Color3(0.1, 1, 0.45),
      start: new Color3(1, 0.35, 0.2),
      goal: new Color3(0.95, 0.2, 0.85),
    };

    mat = new StandardMaterial(`overlay-${kind}`, scene);
    mat.emissiveColor = colors[kind];
    mat.diffuseColor = colors[kind].scale(kind === "path" ? 0.5 : 0.35);
    mat.specularColor = Color3.Black();
    mat.alpha = kind === "path" ? 1 : 0.88;
    mat.backFaceCulling = false;
    mat.freeze();
    this.overlayMaterials.set(kind, mat);
    return mat;
  }
}
