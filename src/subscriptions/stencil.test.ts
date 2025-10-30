import { afterEach, describe, expect, it, vi } from 'vitest';

describe('stencilSubscription', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useRealTimers();
    vi.unmock('@stencil/core');
  });

  it('returns an empty subscription when stencil internals are unavailable', async () => {
    vi.doMock('@stencil/core', () => ({
      forceUpdate: vi.fn(),
      getRenderingRef: undefined,
    }));

    const { stencilSubscription } = await import('./stencil');

    expect(stencilSubscription()).toEqual({});
  });

  it('tracks stencil elements and triggers updates', async () => {
    vi.useFakeTimers();

    const connectedElm = { isConnected: true, id: 'connected' };
    const disconnectedElm = { isConnected: false, id: 'disconnected' };
    const legacyElm = { id: 'legacy' } as { id: string; isConnected?: boolean };

    const forceUpdate = vi.fn((elm: typeof connectedElm) => elm.isConnected !== false);
    const getRenderingRef = vi
      .fn()
      .mockReturnValueOnce(connectedElm)
      .mockReturnValueOnce(disconnectedElm)
      .mockReturnValueOnce(legacyElm)
      .mockReturnValueOnce(undefined);

    vi.doMock('@stencil/core', () => ({
      forceUpdate,
      getRenderingRef,
    }));

    const { stencilSubscription } = await import('./stencil');

    const subscription = stencilSubscription();

    subscription.set?.('missing');
    expect(forceUpdate).not.toHaveBeenCalled();

    subscription.get?.('prop');
    subscription.get?.('prop');
    subscription.get?.('prop');
    subscription.get?.('prop');

    expect(getRenderingRef).toHaveBeenCalledTimes(4);

    subscription.set?.('prop');

    expect(forceUpdate).toHaveBeenCalledTimes(3);
    expect(forceUpdate.mock.calls[0]?.[0]).toBe(connectedElm);
    expect(forceUpdate.mock.calls[1]?.[0]).toBe(disconnectedElm);
    expect(forceUpdate.mock.calls[2]?.[0]).toBe(legacyElm);

    vi.runAllTimers();

    forceUpdate.mockClear();

    subscription.reset?.();

    expect(forceUpdate).toHaveBeenCalledTimes(2);
    expect(forceUpdate.mock.calls[0]?.[0]).toBe(connectedElm);
    expect(forceUpdate.mock.calls[1]?.[0]).toBe(legacyElm);

    vi.runAllTimers();

    forceUpdate.mockClear();
    subscription.dispose?.();
    subscription.reset?.();

    expect(forceUpdate).not.toHaveBeenCalled();
  });
});
