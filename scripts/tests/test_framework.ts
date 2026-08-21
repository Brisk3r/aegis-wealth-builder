/**
 * Aegis Arcade Hub - High-Precision Test Framework
 * Pure 7-bit ASCII Compliant - Windows ANSI-1252 Safe.
 */

class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, String(value));
  }
}

export class MockAudioParam {
  public value: number = 0;
  setValueAtTime(val: number): void {
    this.value = val;
  }
  exponentialRampToValueAtTime(val: number): void {
    this.value = val;
  }
  linearRampToValueAtTime(val: number): void {
    this.value = val;
  }
}

export class MockAudioNode {
  public connectedTo: MockAudioNode[] = [];
  connect<T extends MockAudioNode>(dest: T): T {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect(): void {
    this.connectedTo = [];
  }
}

export class MockGainNode extends MockAudioNode {
  public gain = new MockAudioParam();
}

export class MockOscillatorNode extends MockAudioNode {
  public type: OscillatorType = "sine";
  public frequency = new MockAudioParam();
  start(): void {}
  stop(): void {}
}

export class MockBiquadFilterNode extends MockAudioNode {
  public type: BiquadFilterType = "lowpass";
  public frequency = new MockAudioParam();
  public gain = new MockAudioParam();
  public Q = new MockAudioParam();
}

export class MockAudioBufferSourceNode extends MockAudioNode {
  public buffer: unknown = null;
  start(): void {}
  stop(): void {}
}

export class MockAudioContext {
  public state: AudioContextState = "running";
  public currentTime: number = 0.0;
  public sampleRate: number = 44100;
  public destination = new MockAudioNode();

  createGain(): MockGainNode {
    return new MockGainNode();
  }

  createOscillator(): MockOscillatorNode {
    return new MockOscillatorNode();
  }

  createBiquadFilter(): MockBiquadFilterNode {
    return new MockBiquadFilterNode();
  }

  createBuffer(channels: number, length: number, sampleRate: number): { numberOfChannels: number; length: number; sampleRate: number; getChannelData: () => Float32Array } {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: () => new Float32Array(length),
    };
  }

  createBufferSource(): MockAudioBufferSourceNode {
    return new MockAudioBufferSourceNode();
  }

  async resume(): Promise<void> {
    this.state = "running";
  }

  async suspend(): Promise<void> {
    this.state = "suspended";
  }
}

interface GlobalWithMocks {
  localStorage?: Storage;
  window?: {
    localStorage?: Storage;
    AudioContext?: typeof MockAudioContext;
    devicePixelRatio?: number;
    setInterval?: (handler: TimerHandler, timeout?: number) => number;
    clearInterval?: (id?: number) => void;
    setTimeout?: typeof setTimeout;
    clearTimeout?: typeof clearTimeout;
  };
  navigator?: {
    vibrate?: (pattern: number | number[]) => boolean;
    clipboard?: {
      writeText: (text: string) => Promise<void>;
    };
  };
  AudioContext?: typeof MockAudioContext;
  btoa?: (data: string) => string;
  atob?: (data: string) => string;
}

export function setupBrowserEnvironment(): void {
  const globalObj = globalThis as unknown as GlobalWithMocks;

  if (typeof globalObj.localStorage === "undefined" || !globalObj.localStorage.getItem) {
    globalObj.localStorage = new MemoryStorage();
  }

  if (typeof globalObj.window === "undefined") {
    globalObj.window = {
      localStorage: globalObj.localStorage,
      AudioContext: MockAudioContext,
      devicePixelRatio: 2,
      setInterval: (fn: TimerHandler, ms?: number) => setInterval(fn, ms) as unknown as number,
      clearInterval: (id?: number) => clearInterval(id),
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
    };
  } else {
    if (!globalObj.window.AudioContext) {
      globalObj.window.AudioContext = MockAudioContext;
    }
  }

  if (typeof globalObj.navigator === "undefined") {
    globalObj.navigator = {
      vibrate: () => true,
      clipboard: {
        writeText: async () => {},
      },
    };
  }

  if (typeof globalObj.AudioContext === "undefined") {
    globalObj.AudioContext = MockAudioContext;
  }

  if (typeof globalObj.btoa === "undefined") {
    globalObj.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
  }

  if (typeof globalObj.atob === "undefined") {
    globalObj.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
  }
}

setupBrowserEnvironment();

export function resetLocalStorage(): void {
  if (typeof globalThis.localStorage !== "undefined") {
    globalThis.localStorage.clear();
  }
}

export class TestAssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestAssertionError";
  }
}

export function assert(condition: boolean, message: string = "Assertion failed"): void {
  if (!condition) {
    throw new TestAssertionError(message);
  }
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(actual)}`
    );
  }
}

export function assertDeepEquals<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Deep equality mismatch:\nExpected: ${expectedStr}\nActual:   ${actualStr}`
    );
  }
}

export function assertNear(actual: number, expected: number, tolerance: number = 0.001, message?: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${expected} (+/- ${tolerance}), but got ${actual}`
    );
  }
}

export function assertTrue(condition: boolean, message: string = "Expected condition to be true"): void {
  assert(condition === true, message);
}

export function assertFalse(condition: boolean, message: string = "Expected condition to be false"): void {
  assert(condition === false, message);
}

export function assertGreaterThan(actual: number, baseline: number, message?: string): void {
  if (actual <= baseline) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${actual} > ${baseline}`
    );
  }
}

export function assertGreaterThanOrEqual(actual: number, baseline: number, message?: string): void {
  if (actual < baseline) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${actual} >= ${baseline}`
    );
  }
}

export function assertLessThan(actual: number, ceiling: number, message?: string): void {
  if (actual >= ceiling) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${actual} < ${ceiling}`
    );
  }
}

export function assertLessThanOrEqual(actual: number, ceiling: number, message?: string): void {
  if (actual > ceiling) {
    throw new TestAssertionError(
      `${message ? message + " - " : ""}Expected ${actual} <= ${ceiling}`
    );
  }
}

export function assertThrows(fn: () => void, message?: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new TestAssertionError(message || "Expected function to throw an error, but it succeeded");
  }
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export interface TestSuiteResult {
  suiteName: string;
  tier: number;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestCaseResult[];
}

export class TestSuiteRunner {
  private suiteName: string;
  private tier: number;
  private tests: { name: string; fn: () => void | Promise<void> }[] = [];

  constructor(suiteName: string, tier: number) {
    this.suiteName = suiteName;
    this.tier = tier;
  }

  test(name: string, fn: () => void | Promise<void>): void {
    this.tests.push({ name, fn });
  }

  async run(): Promise<TestSuiteResult> {
    setupBrowserEnvironment();
    const results: TestCaseResult[] = [];
    let passedCount = 0;
    let failedCount = 0;
    const startSuite = performance.now();

    for (const t of this.tests) {
      const startTest = performance.now();
      try {
        await t.fn();
        const durationMs = parseFloat((performance.now() - startTest).toFixed(2));
        results.push({ name: t.name, passed: true, durationMs });
        passedCount++;
      } catch (err: unknown) {
        const durationMs = parseFloat((performance.now() - startTest).toFixed(2));
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          name: t.name,
          passed: false,
          durationMs,
          error: errorMessage,
        });
        failedCount++;
      }
    }

    const durationMs = parseFloat((performance.now() - startSuite).toFixed(2));

    return {
      suiteName: this.suiteName,
      tier: this.tier,
      total: this.tests.length,
      passed: passedCount,
      failed: failedCount,
      durationMs,
      results,
    };
  }
}

export function createTestSuite(name: string, tier: number): TestSuiteRunner {
  return new TestSuiteRunner(name, tier);
}
