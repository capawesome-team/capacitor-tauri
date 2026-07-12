import { existsSync } from 'fs';
import { join } from 'path';

import type { CapacitorAppConfig } from '../shared/definitions';

import { fail } from './log';

export interface CliContext {
  rootDir: string;
  webDir: string;
  config: CapacitorAppConfig;
  /** Absolute path of the user-owned `src-tauri/` project. */
  tauriDir: string;
}

export function readCliContext(): CliContext {
  const rootDir = process.env.CAPACITOR_ROOT_DIR;
  if (!rootDir) {
    return fail(
      'CAPACITOR_ROOT_DIR is not set. This command must be invoked by the Capacitor CLI, e.g. `npx cap sync @capawesome/capacitor-tauri`.',
    );
  }
  let config: CapacitorAppConfig = {};
  const rawConfig = process.env.CAPACITOR_CONFIG;
  if (rawConfig) {
    try {
      config = JSON.parse(rawConfig) as CapacitorAppConfig;
    } catch {
      return fail('CAPACITOR_CONFIG contains invalid JSON.');
    }
  }
  return {
    rootDir,
    webDir: process.env.CAPACITOR_WEB_DIR ?? '',
    config,
    tauriDir: join(rootDir, 'src-tauri'),
  };
}

export function requireTauriDir(context: CliContext): void {
  if (!existsSync(context.tauriDir)) {
    fail(
      `No Tauri project found at ${context.tauriDir}. Run \`npx cap add @capawesome/capacitor-tauri\` first.`,
    );
  }
}
