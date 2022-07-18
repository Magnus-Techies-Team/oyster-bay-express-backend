interface TimeoutData {
  startedAt: number;
  // eslint-disable-next-line no-undef
  timerId: NodeJS.Timeout;
  handler: () => void;
}

export default class TimeoutTimer {
  #timers: Map<string, TimeoutData> = new Map();

  constructor(readonly timeoutDuration: number) {}

  start(key: string, handler: () => void): void {
    this.stop(key);
    const timerId = setTimeout(() => {
      this.stop(key);
      handler();
    }, this.timeoutDuration);
    this.#timers.set(key, { timerId, startedAt: Date.now(), handler });
  }

  // pause(key: string) {
  //   const d = this.#timers.get(key);
  //
  // }
  //
  // resume(key: string, handler: () => void) {
  //   //
  // }

  stop(key: string): boolean {
    const d = this.#timers.get(key);
    if (d !== undefined) {
      clearTimeout(d.timerId);
      return this.#timers.delete(key);
    } else {
      return false;
    }
  }

  timePassed(key: string): number | undefined {
    const d = this.#timers.get(key);
    return d === undefined ? undefined : Date.now() - d.startedAt;
  }

  timeLeft(key: string): number | undefined {
    const timePassed = this.timePassed(key);
    return timePassed === undefined
      ? undefined
      : this.timeoutDuration - timePassed;
  }

  has(key: string): boolean {
    return this.#timers.has(key);
  }
}
