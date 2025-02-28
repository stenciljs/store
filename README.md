# @stencil/store

Store is a lightweight shared state library by the [StencilJS](https://stenciljs.com/) core team. It implements a simple key/value map that efficiently re-renders components when necessary.

**Highlights:**

- 🪶 Lightweight
- ⚡ Zero dependencies
- 📦 Simple API, like a reactive Map
- 🚀 Best performance

## Installation

```
npm install @stencil/store --save-dev
```

## Example

**store.ts:**

```ts
import { createStore } from "@stencil/store";

const { state, onChange } = createStore({
  clicks: 0,
  seconds: 0,
  squaredClicks: 0
});

onChange('clicks', value => {
  state.squaredClicks = value ** 2;
});

export default state;
```

**component.tsx:**

```tsx
import { Component, h } from '@stencil/core';
import state from '../store';

@Component({
  tag: 'app-profile',
})
export class AppProfile {

  componentWillLoad() {
    setInterval(() => state.seconds++, 1000);
  }

  render() {
    return (
      <div>
        <p>
          <MyGlobalCounter />
          <p>
            Seconds: {state.seconds}
            <br />
            Squared Clicks: {state.squaredClicks}
          </p>
        </p>
      </div>
    );
  }
}

const MyGlobalCounter = () => {
  return (
    <button onClick={() => state.clicks++}>
      {state.clicks}
    </button>
  );
};
```

## API

### `createStore<T>(initialState?: T | (() => T), shouldUpdate?)`

Create a new store with the given initial state. The type is inferred from `initialState`, or can be passed as the generic type `T`.
`initialState` can be a function that returns the actual initial state. This feature is just in case you have deep objects that mutate
as otherwise we cannot keep track of those.

```ts
const { reset, state } = createStore(() => ({
  pageA: {
    count: 1
  },
  pageB: {
    count: 1
  }
}));

state.pageA.count = 2;
state.pageB.count = 3;

reset();

state.pageA.count; // 1
state.pageB.count; // 1
```

Please, bear in mind that the object needs to be created inside the function, not just referenced. The following example won't work
as you might want it to, as the returned object is always the same one.

```ts
const object = {
  pageA: {
    count: 1
  },
  pageB: {
    count: 1
  }
};
const { reset, state } = createStore(() => object);

state.pageA.count = 2;
state.pageB.count = 3;

reset();

state.pageA.count; // 2
state.pageB.count; // 3
```

By default, store performs a exact comparison (`===`) between the new value, and the previous one in order to prevent unnecessary rerenders, however, this behaviour can be changed by providing a `shouldUpdate` function through the second argument. When this function returns `false`, the value won't be updated. By providing a custom `shouldUpdate()` function, applications can create their own fine-grained change detection logic, beyond the default `===`. This may be useful for certain use-cases to avoid any expensive re-rendering.

```ts
const shouldUpdate = (newValue, oldValue, propChanged) => {
  return JSON.stringify(newValue) !== JSON.stringify(oldValue);
}
```

Returns a `store` object with the following properties.

#### `store.state`

The state object is proxied, i. e. you can directly get and set properties. If you access the state object in the `render` function of your component, Store will automatically re-render it when the state object is changed.

Note: [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) objects are not supported by IE11 (not even with a polyfill), so you need to use the `store.get` and `store.set` methods of the API if you wish to support IE11.

#### `store.on(event, listener)`

Add a listener to the store for a certain action.

#### `store.onChange(propName, listener)`

Add a listener that is called when a specific property changes (either from a `set` or `reset`).

#### `store.get(propName)`

Get a property's value from the store.

#### `store.set(propName, value)`

Set a property's value in the store.

#### `store.reset()`

Reset the store to its initial state.

#### `store.use(...subscriptions)`

Use the given subscriptions in the store. A subscription is an object that defines one or more of the properties `get`, `set` or `reset`.

```ts
const { reset, state, use } = createStore({ a: 1, b: 2});

const unlog = use({
  get: (key) => {
    console.log(`Someone's reading prop ${key}`);
  },
  set: (key, newValue, oldValue) => {
    console.log(`Prop ${key} changed from ${oldValue} to ${newValue}`);
  },
  reset: () => {
    console.log('Store got reset');
  },
  dispose: () => {
    console.log('Store got disposed');
  },
})

state.a; // Someone's reading prop a
state.b = 3; // Prop b changed from 2 to 3
reset(); // Store got reset

unlog();

state.a; // Nothing is logged
state.b = 5; // Nothing is logged
reset(); // Nothing is logged
```

#### `store.dispose()`

Resets the store and all the internal state of the store that should not survive between tests.


## Testing

Like any global state library, state should be `dispose`d between each spec test.
Use the `dispose()` API in the `beforeEach` hook.

```ts
import store from '../store';

beforeEach(() => {
  store.dispose();
});
```
