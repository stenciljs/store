/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface ChangeStore {
        "storeKey": 'hola' | 'adios';
        "storeValue": string;
    }
    interface DisplayStore {
        "storeKey": 'hello' | 'goodbye';
    }
    interface SimpleStore {
        "next": () => Promise<void>;
    }
}
declare global {
    interface HTMLChangeStoreElement extends Components.ChangeStore, HTMLStencilElement {
    }
    var HTMLChangeStoreElement: {
        prototype: HTMLChangeStoreElement;
        new (): HTMLChangeStoreElement;
    };
    interface HTMLDisplayStoreElement extends Components.DisplayStore, HTMLStencilElement {
    }
    var HTMLDisplayStoreElement: {
        prototype: HTMLDisplayStoreElement;
        new (): HTMLDisplayStoreElement;
    };
    interface HTMLSimpleStoreElement extends Components.SimpleStore, HTMLStencilElement {
    }
    var HTMLSimpleStoreElement: {
        prototype: HTMLSimpleStoreElement;
        new (): HTMLSimpleStoreElement;
    };
    interface HTMLElementTagNameMap {
        "change-store": HTMLChangeStoreElement;
        "display-store": HTMLDisplayStoreElement;
        "simple-store": HTMLSimpleStoreElement;
    }
}
declare namespace LocalJSX {
    interface ChangeStore {
        "storeKey"?: 'hola' | 'adios';
        "storeValue"?: string;
    }
    interface DisplayStore {
        "storeKey"?: 'hello' | 'goodbye';
    }
    interface SimpleStore {
    }
    interface IntrinsicElements {
        "change-store": ChangeStore;
        "display-store": DisplayStore;
        "simple-store": SimpleStore;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "change-store": LocalJSX.ChangeStore & JSXBase.HTMLAttributes<HTMLChangeStoreElement>;
            "display-store": LocalJSX.DisplayStore & JSXBase.HTMLAttributes<HTMLDisplayStoreElement>;
            "simple-store": LocalJSX.SimpleStore & JSXBase.HTMLAttributes<HTMLSimpleStoreElement>;
        }
    }
}
