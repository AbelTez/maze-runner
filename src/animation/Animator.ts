export class Animator {
    private lastUpdate: number = 0;

    private interval: number;

    constructor(interval: number = 50) {
        this.interval = interval;
    }

    shouldUpdate(): boolean {
        const now = performance.now();

        if (
            now - this.lastUpdate >=
            this.interval
        ) {
            this.lastUpdate = now;

            return true;
        }

        return false;
    }
}