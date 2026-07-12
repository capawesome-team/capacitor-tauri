// Minimal `invoke` for the Tauri IPC, without depending on
// `@tauri-apps/api`. `window.__TAURI_INTERNALS__.invoke` is what that package
// compiles down to; it is always injected by the Tauri runtime.
//
// Note: `__TAURI_INTERNALS__` is not part of Tauri's documented public API,
// but it is the stable transport within Tauri 2.x. This coupling is
// intentional and isolated to this file.

type InvokeArgs = Record<string, unknown> | Uint8Array | ArrayBuffer;

interface InvokeOptions {
  headers: Record<string, string>;
}

interface TauriInternals {
  invoke(
    command: string,
    args?: InvokeArgs,
    options?: InvokeOptions,
  ): Promise<unknown>;
}

export function invoke<T>(
  command: string,
  args?: InvokeArgs,
  options?: InvokeOptions,
): Promise<T> {
  const internals = (
    window as unknown as { __TAURI_INTERNALS__?: TauriInternals }
  ).__TAURI_INTERNALS__;
  if (!internals) {
    return Promise.reject(
      new Error('Tauri IPC is not available. Is this running inside Tauri?'),
    );
  }
  return internals.invoke(command, args, options) as Promise<T>;
}

/**
 * Calls a command on an official `tauri-plugin-*`, addressed as
 * `plugin:<pluginName>|<command>`.
 */
export function invokePlugin<T>(
  pluginName: string,
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  return invoke<T>(`plugin:${pluginName}|${command}`, args);
}
