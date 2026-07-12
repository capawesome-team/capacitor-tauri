import type { CuratedPlugin } from './definitions';

/**
 * The curated Tier-2 plugin catalog: Capacitor plugin APIs implemented on
 * top of official `tauri-plugin-*` crates. Each entry drives both the JS
 * shim (which plugins are registered) and the sync-time codegen (which
 * crates and capability grants land in the scaffold). Kept intentionally
 * small; expand by demand.
 */
export const CURATED_CATALOG: CuratedPlugin[] = [
  {
    name: 'Filesystem',
    crate: 'tauri-plugin-fs',
    crateVersion: '2',
    capabilities: [
      'fs:allow-read-file',
      'fs:allow-read-text-file',
      'fs:allow-write-file',
      'fs:allow-write-text-file',
      'fs:allow-remove',
      'fs:allow-mkdir',
      'fs:allow-read-dir',
      'fs:allow-stat',
      'fs:allow-rename',
      'fs:allow-copy-file',
      'fs:allow-exists',
      // App-scoped read/write; broader scopes are the user's decision.
      'fs:allow-appdata-read-recursive',
      'fs:allow-appdata-write-recursive',
    ],
  },
  {
    name: 'Preferences',
    crate: 'tauri-plugin-store',
    crateVersion: '2',
    capabilities: ['store:default'],
  },
  {
    name: 'Dialog',
    crate: 'tauri-plugin-dialog',
    crateVersion: '2',
    capabilities: ['dialog:default'],
  },
  {
    name: 'LocalNotifications',
    crate: 'tauri-plugin-notification',
    crateVersion: '2',
    capabilities: ['notification:default'],
  },
];
