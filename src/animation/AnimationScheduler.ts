/**
 * Delta-time scheduler decoupled from display refresh rate.
 * stepsPerSecond controls algorithm steps, not render frames.
 */
export class AnimationScheduler {
  private accumulatorMs = 0;
  private stepsPerSecond: number;
  private paused = false;

  constructor(stepsPerSecond: number) {
    this.stepsPerSecond = Math.max(1, stepsPerSecond);
  }

  setStepsPerSecond(rate: number): void {
    this.stepsPerSecond = Math.max(1, rate);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  isPaused(): boolean {
    return this.paused;
  }

  /** Returns how many logical steps to run this frame (0 if paused). */
  consumeSteps(deltaMs: number): number {
    if (this.paused) {
      return 0;
    }

    const stepInterval = 1000 / this.stepsPerSecond;
    this.accumulatorMs += deltaMs;

    let steps = 0;
    while (this.accumulatorMs >= stepInterval) {
      this.accumulatorMs -= stepInterval;
      steps++;
      if (steps >= 8) {
        this.accumulatorMs = 0;
        break;
      }
    }

    return steps;
  }

  reset(): void {
    this.accumulatorMs = 0;
  }
}
