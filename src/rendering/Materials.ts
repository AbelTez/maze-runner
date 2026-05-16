import {
    Scene,
    StandardMaterial,
    Color3
} from "@babylonjs/core";

export class Materials {
    static createWallMaterial(scene: Scene): StandardMaterial {
        const material = new StandardMaterial(
            "wallMaterial",
            scene
        );

        material.diffuseColor = new Color3(0.85, 0.85, 0.85);

        return material;
    }

    static createFloorMaterial(scene: Scene): StandardMaterial {
        const material = new StandardMaterial(
            "floorMaterial",
            scene
        );

        material.diffuseColor = new Color3(0.15, 0.15, 0.15);

        return material;
    }
}