import { describe, expect, it, vi } from 'vitest';
import { appendToMap, debounce } from './utils';

describe('appendToMap', () => {
  it('should add value to empty map', () => {
    const testMap = new Map<string, WeakRef<any>[]>();
    const obj = { id: 1 };
    appendToMap(testMap, 'key1', obj);
    
    const refs = testMap.get('key1');
    expect(refs).toHaveLength(1);
    expect(refs![0].deref()).toBe(obj);
  });

  it('should append value to existing array', () => {
    const testMap = new Map<string, WeakRef<any>[]>();
    const obj1 = { id: 1 };
    const obj2 = { id: 3 };
    
    appendToMap(testMap, 'key1', obj1);
    appendToMap(testMap, 'key1', obj2);
    
    const refs = testMap.get('key1');
    expect(refs).toHaveLength(2);
    expect(refs![0].deref()).toBe(obj1);
    expect(refs![1].deref()).toBe(obj2);
  });

  it('should not append duplicate value', () => {
    const testMap = new Map<string, WeakRef<any>[]>();
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    
    appendToMap(testMap, 'key1', obj1);
    appendToMap(testMap, 'key1', obj2);
    appendToMap(testMap, 'key1', obj1); // Duplicate
    
    const refs = testMap.get('key1');
    expect(refs).toHaveLength(2);
    expect(refs![0].deref()).toBe(obj1);
    expect(refs![1].deref()).toBe(obj2);
  });
});

describe('debounce', () => {
  it('should debounce function calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should cancel previous timeout on new calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});