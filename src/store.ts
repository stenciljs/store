import { stencilSubscription } from './subscriptions/stencil';
import { createObservableMap } from './observable-map';
import { ObservableMap } from './types';

export const createStore = <T extends { [key: string]: any }>(
  defaultState?: T | (() => T),
  shouldUpdate?: (newV: any, oldValue: any, prop: keyof T) => boolean,
): ObservableMap<T> => {
  const map = createObservableMap(defaultState, shouldUpdate);
  map.use(stencilSubscription());
  return map;
};
