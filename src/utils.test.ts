import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { appendToMap, debounce } from './utils';

describe('appendToMap', () => {
  let testMap: Map<string, Set<WeakRef<Object>>>;
  let refsByValue: WeakMap<Object, WeakRef<Object>>;

  beforeEach(() => {
    testMap = new Map();
    refsByValue = new WeakMap();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should add value to empty map', () => {
    const obj = { id: 1 };
    appendToMap(testMap, refsByValue, 'key1', obj);

    const refs = [...testMap.get('key1')!];
    expect(refs).toHaveLength(1);
    expect(refs[0].deref()).toBe(obj);
  });

  it('should append value to existing set', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 3 };

    appendToMap(testMap, refsByValue, 'key1', obj1);
    appendToMap(testMap, refsByValue, 'key1', obj2);

    const refs = [...testMap.get('key1')!];
    expect(refs).toHaveLength(2);
    expect(refs[0].deref()).toBe(obj1);
    expect(refs[1].deref()).toBe(obj2);
  });

  it('should not append duplicate value', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    appendToMap(testMap, refsByValue, 'key1', obj1);
    appendToMap(testMap, refsByValue, 'key1', obj2);
    appendToMap(testMap, refsByValue, 'key1', obj1); // Duplicate

    const refs = [...testMap.get('key1')!];
    expect(refs).toHaveLength(2);
    expect(refs[0].deref()).toBe(obj1);
    expect(refs[1].deref()).toBe(obj2);
  });

  it('reuses the same WeakRef across property buckets', () => {
    const obj = { id: 1 };
    appendToMap(testMap, refsByValue, 'key1', obj);
    appendToMap(testMap, refsByValue, 'key2', obj);
    const key1Ref = [...testMap.get('key1')!][0];
    const key2Ref = [...testMap.get('key2')!][0];
    expect(key1Ref).toBe(key2Ref);
    expect(key1Ref.deref()).toBe(obj);
  });

  it('does not dereference existing refs when deduplicating the same value', () => {
    const deref = vi.fn();
    class TestWeakRef<T extends object> {
      constructor(private readonly value: T) {}

      deref(): T {
        deref();
        return this.value;
      }
    }
    vi.stubGlobal('WeakRef', TestWeakRef);

    const obj = { id: 1 };
    appendToMap(testMap, refsByValue, 'key1', obj);
    appendToMap(testMap, refsByValue, 'key1', obj);

    expect([...testMap.get('key1')!]).toHaveLength(1);
    expect(deref).not.toHaveBeenCalled();
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    // Call the debounced function multiple times
    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    // Function should not have been called yet
    expect(mockFn).not.toHaveBeenCalled();

    // Fast forward time
    vi.runAllTimers();

    // Function should have been called once with the last arguments
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(3);
  });

  it('should cancel previous timeout on new calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn(1);

    // Advance timer halfway
    vi.advanceTimersByTime(500);

    debouncedFn(2);

    // Advance to just before the second call would trigger
    vi.advanceTimersByTime(999);
    expect(mockFn).not.toHaveBeenCalled();

    // Advance the remaining time
    vi.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(2);
  });
});
