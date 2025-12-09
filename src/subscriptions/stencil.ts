import * as StencilCore from '@stencil/core';
import { Subscription } from '../types';
import { appendToMap, debounce } from '../utils';

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement: any) => !('isConnected' in maybeElement) || maybeElement.isConnected;

const cleanupElements = debounce((map: Map<string, WeakRef<any>[]>) => {
  for (let key of map.keys()) {
    const refs = map.get(key).filter((ref) => {
      const elm = ref.deref();
      return elm && isConnected(elm);
    });
    map.set(key, refs);
  }
}, 2_000);

const core = StencilCore as unknown as {
  forceUpdate?: (elm: any) => boolean;
  getRenderingRef?: () => any;
};

const forceUpdate = core.forceUpdate;
const getRenderingRef = core.getRenderingRef;

export const stencilSubscription = <T>(): Subscription<T> => {
  if (typeof getRenderingRef !== 'function' || typeof forceUpdate !== 'function') {
    // If we are not in a stencil project, we do nothing.
    // This function is not really exported by @stencil/core.
    return {};
  }

  const ensureForceUpdate = forceUpdate;
  const ensureGetRenderingRef = getRenderingRef;
  const elmsToUpdate = new Map<string, WeakRef<any>[]>();

  return {
    dispose: () => elmsToUpdate.clear(),
    get: (propName) => {
      const elm = ensureGetRenderingRef();
      if (elm) {
        appendToMap(elmsToUpdate, propName as string, elm);
      }
    },
    set: (propName) => {
      const refs = elmsToUpdate.get(propName as string);
      if (refs) {
        const nextRefs = refs.filter((ref) => {
          const elm = ref.deref();
          if (!elm) return false;
          return ensureForceUpdate(elm);
        });
        elmsToUpdate.set(propName as string, nextRefs);
      }
      cleanupElements(elmsToUpdate);
    },
    reset: () => {
      elmsToUpdate.forEach((refs) => {
        refs.forEach((ref) => {
          const elm = ref.deref();
          if (elm) ensureForceUpdate(elm);
        });
      });
      cleanupElements(elmsToUpdate);
    },
  };
};
