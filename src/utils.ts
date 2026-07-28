export const appendToMap = <K, V extends Object>(
  map: Map<K, Set<WeakRef<V>>>,
  refsByValue: WeakMap<V, WeakRef<V>>,
  propName: K,
  value: V,
): void => {
  let ref = refsByValue.get(value);
  if (!ref) {
    ref = new WeakRef(value);
    refsByValue.set(value, ref);
  }
  let refs = map.get(propName);
  if (!refs) {
    refs = new Set();
    map.set(propName, refs);
  }
  refs.add(ref);
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: any;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = 0;
      fn(...args);
    }, ms);
  };
};
