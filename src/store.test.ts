import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('./observable-map', () => {
  return {
    createObservableMap: vi.fn(),
  };
});

vi.mock('./subscriptions/stencil', () => {
  return {
    stencilSubscription: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createStore', () => {
  it('creates an observable map and wires the stencil subscription', async () => {
    const map = { use: vi.fn(), state: {} } as const;
    const subscription = { get: vi.fn() };

    const { createObservableMap } = await import('./observable-map');
    const { stencilSubscription } = await import('./subscriptions/stencil');

    (createObservableMap as unknown as Mock).mockReturnValue(map as any);
    (stencilSubscription as unknown as Mock).mockReturnValue(subscription as any);

    const { createStore } = await import('./store');

    const defaultState = { value: 1 };
    const shouldUpdate = vi.fn();

    const result = createStore(defaultState, shouldUpdate);

    expect(createObservableMap).toHaveBeenCalledWith(defaultState, shouldUpdate);
    expect(map.use).toHaveBeenCalledWith(subscription);
    expect(result).toBe(map);
  });
});
