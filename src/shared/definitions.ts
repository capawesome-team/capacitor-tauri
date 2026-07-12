/**
 * Subset of the Capacitor configuration this platform consumes. Provided by
 * the Capacitor CLI via the `CAPACITOR_CONFIG` environment variable.
 */
export interface CapacitorAppConfig {
  appId?: string;
  appName?: string;
  webDir?: string;
  server?: {
    url?: string;
  };
  [key: string]: unknown;
}

/**
 * A curated Tier-2 plugin: a Capacitor plugin API implemented on top of an
 * official `tauri-plugin-*` crate. The `capabilities` are the Tauri
 * permission identifiers required for the plugin's commands; they are
 * emitted into the generated capability file at sync time.
 */
export interface CuratedPlugin {
  /** Capacitor plugin registration name, e.g. `Filesystem`. */
  name: string;
  /** The `tauri-plugin-*` crate this shim depends on, e.g. `tauri-plugin-fs`. */
  crate: string;
  /** Semver requirement for the crate in the scaffold's `Cargo.toml`. */
  crateVersion: string;
  /** Tauri permission identifiers required by the shim's commands. */
  capabilities: string[];
}
