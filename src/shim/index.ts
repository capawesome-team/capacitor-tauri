// Platform shim, injected by the `capacitor` Tauri plugin via
// `js_init_script` — runs after the global object exists but before any page
// script, so `window.CapacitorCustomPlatform` is set before `@capacitor/core`
// initializes.
//
// Sets `Capacitor.getPlatform()` → 'tauri' and `isNativePlatform()` → true.
// Curated Tier-2 plugins are registered under the plugin registration name so
// `@capacitor/core`'s `registerPlugin` prefers them; everything else falls
// back to the plugin's web implementation automatically.

import { registerCoreAppPlugin } from './plugins/app';
import { curatedPlugins } from './plugins/index';

interface PluginHeaderMethod {
  name: string;
  rtype: 'promise' | 'callback';
}

interface PluginHeader {
  name: string;
  methods: PluginHeaderMethod[];
}

(() => {
  const globalWindow = window as unknown as Record<string, unknown>;
  if (globalWindow.CapacitorCustomPlatform) {
    return;
  }

  const plugins: Record<string, Record<string, unknown>> = {};
  const headers: PluginHeader[] = [];

  const register = (
    name: string,
    implementation: Record<string, unknown>,
  ): void => {
    plugins[name] = implementation;
    headers.push({
      name,
      methods: Object.keys(implementation).map(methodName => ({
        name: methodName,
        rtype: methodName === 'addListener' ? 'callback' : 'promise',
      })),
    });
  };

  registerCoreAppPlugin(register);
  for (const plugin of curatedPlugins) {
    register(plugin.name, plugin.implementation);
  }

  globalWindow.CapacitorCustomPlatform = {
    name: 'tauri',
    plugins,
  };

  // Pre-seed `Capacitor.PluginHeaders` so `registerPlugin(name, { web })`
  // routes to the curated implementation via the native path, with automatic
  // web fallback for any plugin not curated here.
  const capacitor = (globalWindow.Capacitor ?? {}) as Record<
    string,
    unknown
  > & {
    PluginHeaders?: PluginHeader[];
  };
  capacitor.PluginHeaders = [...(capacitor.PluginHeaders ?? []), ...headers];
  capacitor.nativePromise = (
    pluginName: string,
    methodName: string,
    options?: unknown,
  ): Promise<unknown> => {
    if (methodName === 'removeAllListeners') {
      const method = plugins[pluginName]?.removeAllListeners as
        | (() => Promise<unknown>)
        | undefined;
      return method ? method() : Promise.resolve();
    }
    const method = plugins[pluginName]?.[methodName] as
      | ((options?: unknown) => Promise<unknown>)
      | undefined;
    if (!method) {
      return Promise.reject(
        new Error(
          `"${pluginName}.${methodName}()" is not implemented on tauri.`,
        ),
      );
    }
    return method(options);
  };
  // Capacitor routes `addListener` through `nativeCallback` for header
  // plugins; delegate to the implementation's `addListener`.
  capacitor.nativeCallback = (
    pluginName: string,
    methodName: string,
    options: { eventName?: string } | undefined,
    callback: (data?: unknown) => void,
  ): void => {
    if (methodName !== 'addListener' || !options?.eventName) {
      return;
    }
    const addListener = plugins[pluginName]?.addListener as
      | ((
          eventName: string,
          cb: (data?: unknown) => void,
        ) => { remove: () => Promise<void> })
      | undefined;
    addListener?.(options.eventName, callback);
  };
  globalWindow.Capacitor = capacitor;
})();
