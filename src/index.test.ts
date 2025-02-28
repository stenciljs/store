import { describe, it, expect } from 'vitest';
import { createStore, createObservableMap } from './index';

describe('store', () => {
  it('exports createStore and createObservableMap', () => {
    expect(createStore).toBeDefined();
    expect(createObservableMap).toBeDefined();
  });
});
