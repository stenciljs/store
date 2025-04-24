import { OnHandler, OnChangeHandler, Subscription, ObservableMap, Handlers } from './types';

type Invocable<T> = T | (() => T);

const unwrap = <T>(val: Invocable<T>): T => (typeof val === 'function' ? (val as () => T)() : val);

export const createObservableMap = <T extends { [key: string]: any }>(
  defaultState?: Invocable<T>,
  shouldUpdate: (newV: any, oldValue, prop: keyof T) => boolean = (a, b) => a !== b,
): ObservableMap<T> => {
  const unwrappedState = unwrap(defaultState);
  let states = new Map<string, any>(Object.entries(unwrappedState ?? {}));
  const handlers: Handlers<T> = {
    dispose: [],
    get: [],
    set: [],
    reset: [],
  };

  const reset = (): void => {
    // When resetting the state, the default state may be a function - unwrap it to invoke it.
    // otherwise, the state won't be properly reset
    states = new Map<string, any>(Object.entries(unwrap(defaultState) ?? {}));

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

      handlers.set.forEach((cb) => cb(propName, value, oldValue));
    }
  };

  const state = (
    typeof Proxy === 'undefined'
      ? {}
      : new Proxy(unwrappedState, {
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
  ) as T;

  const on: OnHandler<T> = (eventName, callback) => {
    handlers[eventName].push(callback);
    return () => {
      removeFromArray(handlers[eventName], callback);
    };
  };

  const onChange: OnChangeHandler<T> = (propName, cb) => {
    const unSet = on('set', (key, newValue) => {
      if (key === propName) {
        cb(newValue);
      }
    });
    // We need to unwrap the defaultState because it might be a function.
    // Otherwise we might not be sending the right reset value.
    const unReset = on('reset', () => cb(unwrap(defaultState)[propName]));
    return () => {
      unSet();
      unReset();
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
    // Remove the listener from the 'set' event
    removeFromArray(handlers.set, (key, newValue) => {
      if (key === propName) {
        listener(newValue);
      }
    });

    // Remove the listener from the 'reset' event
    removeFromArray(handlers.reset, () => {
      listener(unwrap(defaultState)[propName]);
    });
  };

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
    removeListener
  };
};

const removeFromArray = (array: any[], item: any) => {
  const index = array.indexOf(item);
  if (index >= 0) {
    array[index] = array[array.length - 1];
    array.length--;
  }
};
