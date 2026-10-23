// Only imported behind `Build.isBrowser`, so it must never be bundled into the hydrate app.
(globalThis as any).BROWSER_ONLY_MODULE_LOADED = true;

export {};
