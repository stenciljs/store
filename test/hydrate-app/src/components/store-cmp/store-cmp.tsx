import { Build, Component, h } from '@stencil/core';
import { createStore } from '@stencil/store';

const { state } = createStore({ greeting: 'Hello' });

@Component({ tag: 'store-cmp' })
export class StoreCmp {
  async componentWillLoad() {
    if (Build.isBrowser) {
      await import('./browser-only');
    }
  }

  render() {
    return <p>{state.greeting}</p>;
  }
}
