export const appendToMap = <K, V extends Object>(map: Map<K, WeakRef<V>[]>, propName: K, value: V) => {
  const refs = map.get(propName);
  if (!refs) {
    map.set(propName, []);
  } else if (!refs.some((ref) => ref.deref() === value)) {
    refs.push(new WeakRef(value));
  }
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
