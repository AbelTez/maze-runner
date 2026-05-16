import type { Scene, IDisposable } from "@babylonjs/core";
import { Materials } from "../rendering/Materials";

export class ResourceManager {
  private disposables: IDisposable[] = [];

  register(disposable: IDisposable): void {
    this.disposables.push(disposable);
  }

  disposeAll(scene: Scene): void {
    for (const item of this.disposables) {
      item.dispose();
    }
    this.disposables.length = 0;
    Materials.reset();
    scene.dispose();
  }
}
