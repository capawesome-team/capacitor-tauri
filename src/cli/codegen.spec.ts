import { describe, expect, it } from 'vitest';

import { CURATED_CATALOG } from '../shared/catalog';

import { pluginRegistrations } from './codegen';

describe('pluginRegistrations', () => {
  it('uses the Builder pattern for the store plugin and init() for others', () => {
    const fs = CURATED_CATALOG.find(p => p.crate === 'tauri-plugin-fs');
    const store = CURATED_CATALOG.find(p => p.crate === 'tauri-plugin-store');

    expect(pluginRegistrations([fs!, store!])).toEqual([
      '.plugin(tauri_plugin_fs::init())',
      '.plugin(tauri_plugin_store::Builder::new().build())',
    ]);
  });

  it('returns nothing when no plugins are enabled', () => {
    expect(pluginRegistrations([])).toEqual([]);
  });
});

describe('CURATED_CATALOG', () => {
  it('declares capabilities for every curated plugin', () => {
    for (const plugin of CURATED_CATALOG) {
      expect(plugin.capabilities.length).toBeGreaterThan(0);
      expect(plugin.crate).toMatch(/^tauri-plugin-/);
    }
  });
});
