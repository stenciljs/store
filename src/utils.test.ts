import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { appendToMap, debounce } from './utils';

describe('appendToMap', () => {
  let testMap: Map<string, number[]>;

  beforeEach(() => {
    testMap = new Map();
  });

  it('should add value to empty map', () => {
    appendToMap(testMap, 'key1', 1);
    expect(testMap.get('key1')).toEqual([1]);
  });

  it('should append value to existing array', () => {
    testMap.set('key1', [1, 2]);
    appendToMap(testMap, 'key1', 3);
    expect(testMap.get('key1')).toEqual([1, 2, 3]);
  });

  it('should not append duplicate value', () => {
    testMap.set('key1', [1, 2]);
    appendToMap(testMap, 'key1', 2);
    expect(testMap.get('key1')).toEqual([1, 2]);
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