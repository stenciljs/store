import { OnHandler, OnChangeHandler, Subscription, ObservableMap, Handlers } from './types';

type Invocable<T> = T | (() => T);

const unwrap = <T>(val: Invocable<T>): T => (typeof val === 'function' ? (val as () => T)() : val);

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: Invocable<T>,
  shouldUpdate: (newV: any, oldValue, prop: keyof T) => boolean = (a, b) => a !== b,
): ObservableMap<T> => {
  const resolveDefaultState = (): T => (unwrap(defaultState) ?? {}) as T;
  const initialState = resolveDefaultState();
  let states = new Map<string, any>(Object.entries(initialState));
  const proxyAvailable = typeof Proxy !== 'undefined';
  const plainState: T | null = proxyAvailable ? null : ({} as T);
  const handlers: Handlers<T> = {
    dispose: [],
    get: [],
    set: [],
    reset: [],
  };

  // Track onChange listeners to enable removeListener functionality
  const changeListeners = new Map<Function, { setHandler: Function; resetHandler: Function; propName: keyof T }>();

  const reset = (): void => {
    // When resetting the state, the default state may be a function - unwrap it to invoke it.
    // otherwise, the state won't be properly reset
    states = new Map<string, any>(Object.entries(resolveDefaultState()));
    if (!proxyAvailable) {
      syncPlainStateKeys();
    }

    handlers.reset.forEach((cb) => cb());
  };

  const dispose = (): void => {
    // Call first dispose as resetting the state would
    // cause less updates ;)
    handlers.dispose.forEach((cb) => cb());
    reset();
  };

  const get = <P extends keyof T>(propName: P & string): T[P] => {
    handlers.get.forEach((cb) => cb(propName));

    return states.get(propName);
  };

  const set = <P extends keyof T>(propName: P & string, value: T[P]) => {
    const oldValue = states.get(propName);
    if (shouldUpdate(value, oldValue, propName)) {
      states.set(propName, value);
      if (!proxyAvailable) {
        ensurePlainProperty(propName as string);
      }

      handlers.set.forEach((cb) => cb(propName, value, oldValue));
    }
  };
  const state = (
    proxyAvailable
      ? new Proxy(initialState, {
          get(_, propName) {
            return get(propName as any);
          },
          ownKeys(_) {
            return Array.from(states.keys());
          },
          getOwnPropertyDescriptor() {
            return {
              enumerable: true,
              configurable: true,
            };
          },
          has(_, propName) {
            return states.has(propName as any);
          },
          set(_, propName, value) {
            set(propName as any, value);
            return true;
          },
        })
      : (() => {
          syncPlainStateKeys();
          return plainState!;
        })()
  ) as T;

  const on: OnHandler<T> = (eventName, callback) => {
    handlers[eventName].push(callback);
    return () => {
      removeFromArray(handlers[eventName], callback);
    };
  };

  const onChange: OnChangeHandler<T> = (propName, cb) => {
    const setHandler = (key, newValue) => {
      if (key === propName) {
        cb(newValue);
      }
    };

    const resetHandler = () => {
      const snapshot = resolveDefaultState();
      cb(snapshot[propName]);
    };

    // Register the handlers
    const unSet = on('set', setHandler);
    const unReset = on('reset', resetHandler);

    // Track the relationship between the user callback and internal handlers
    changeListeners.set(cb, { setHandler, resetHandler, propName });

    return () => {
      unSet();
      unReset();
      changeListeners.delete(cb);
    };
  };

  const use = (...subscriptions: Subscription<T>[]): (() => void) => {
    const unsubs = subscriptions.reduce((unsubs, subscription) => {
      if (subscription.set) {
        unsubs.push(on('set', subscription.set));
      }
      if (subscription.get) {
        unsubs.push(on('get', subscription.get));
      }
      if (subscription.reset) {
        unsubs.push(on('reset', subscription.reset));
      }
      if (subscription.dispose) {
        unsubs.push(on('dispose', subscription.dispose));
      }

      return unsubs;
    }, []);

    return () => unsubs.forEach((unsub) => unsub());
  };

  const forceUpdate = (key: string) => {
    const oldValue = states.get(key);
    handlers.set.forEach((cb) => cb(key, oldValue, oldValue));
  };

  const removeListener = (propName: keyof T, listener: (value: any) => void) => {
    const listenerInfo = changeListeners.get(listener);
    if (listenerInfo && listenerInfo.propName === propName) {
      // Remove the specific handlers that were created for this listener
      removeFromArray(handlers.set, listenerInfo.setHandler);
      removeFromArray(handlers.reset, listenerInfo.resetHandler);
      changeListeners.delete(listener);
    }
  };

  function ensurePlainProperty(key: string): void {
    if (proxyAvailable || !plainState) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(plainState, key)) {
      return;
    }

    Object.defineProperty(plainState, key, {
      configurable: true,
      enumerable: true,
      get() {
        return get(key as keyof T & string);
      },
      set(value: any) {
        set(key as keyof T & string, value);
      },
    });
  }

  function syncPlainStateKeys(): void {
    if (proxyAvailable || !plainState) {
      return;
    }

    const knownKeys = new Set(states.keys());

    for (const key of Object.keys(plainState as object)) {
      if (!knownKeys.has(key)) {
        delete (plainState as Record<string, unknown>)[key];
      }
    }

    for (const key of knownKeys) {
      ensurePlainProperty(key);
    }
  }

  return {
    state,
    get,
    set,
    on,
    onChange,
    use,
    dispose,
    reset,
    forceUpdate,
    removeListener,
  };
};
const removeFromArray = (array: any[], item: any) => {
  const index = array.indexOf(item);
  if (index >= 0) {
    array[index] = array[array.length - 1];
    array.length--;
  }
};
