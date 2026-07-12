import { existsSync } from 'fs';
import { cp, rm } from 'fs/promises';

import { generateCapabilities, generateRustGlue } from './codegen';
import type { CliContext } from './context';
import { requireTauriDir } from './context';
import { fail, logInfo } from './log';

export async function copyCommand(context: CliContext): Promise<void> {
  requireTauriDir(context);
  if (!context.config.server?.url) {
    if (!context.webDir || !existsSync(context.webDir)) {
      fail(
        `Web assets directory ${context.webDir || '(unset)'} does not exist. Build your web app first.`,
      );
    }
    const distDir = `${context.tauriDir}/dist`;
    await rm(distDir, { recursive: true, force: true });
    await cp(context.webDir, distDir, { recursive: true });
    logInfo(`Copied web assets to ${distDir}.`);
  }
}

export async function updateCommand(context: CliContext): Promise<void> {
  requireTauriDir(context);
  await generateCapabilities(context);
  await generateRustGlue(context);
}
