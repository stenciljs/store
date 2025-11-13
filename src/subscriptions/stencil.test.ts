import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const coreMock = vi.hoisted(() => ({
  exports: {} as {
    forceUpdate?: ReturnType<typeof vi.fn>;
    getRenderingRef?: ReturnType<typeof vi.fn>;
  },
}));

vi.mock('@stencil/core', () => coreMock.exports);

describe('stencilSubscription', () => {
  beforeEach(() => {
    coreMock.exports.forceUpdate = undefined;
    coreMock.exports.getRenderingRef = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it('returns an empty subscription when stencil internals are unavailable', async () => {
    coreMock.exports.forceUpdate = vi.fn();
    coreMock.exports.getRenderingRef = undefined;

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

    coreMock.exports.forceUpdate = forceUpdate as any;
    coreMock.exports.getRenderingRef = getRenderingRef as any;

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
