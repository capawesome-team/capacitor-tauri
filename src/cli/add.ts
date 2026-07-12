import { existsSync } from 'fs';
import { cp, mkdir, readFile, readdir, writeFile } from 'fs/promises';
import { join } from 'path';

import type { CliContext } from './context';
import { fail, logInfo } from './log';

const TEXT_EXTENSIONS = ['.rs', '.toml', '.json', '.md', '.ts'];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app';

export async function addCommand(context: CliContext): Promise<void> {
  if (existsSync(context.tauriDir)) {
    fail(
      `${context.tauriDir} already exists. Delete it first if you want to re-add the tauri platform.`,
    );
  }
  const templatesDir = join(__dirname, '../../templates/scaffold');
  const appName = context.config.appName ?? 'App';
  const variables: Record<string, string> = {
    APP_ID: context.config.appId ?? 'com.example.app',
    APP_NAME: appName,
    APP_NAME_SLUG: slugify(appName),
  };
  await copyTemplates(templatesDir, context.tauriDir, variables);
  logInfo(`Created ${context.tauriDir}.`);
  logInfo('Next steps:');
  logInfo('  1. npx cap sync @capawesome/capacitor-tauri');
  logInfo('  2. npx cap run @capawesome/capacitor-tauri');
}

async function copyTemplates(
  sourceDir: string,
  targetDir: string,
  variables: Record<string, string>,
): Promise<void> {
  await mkdir(targetDir, { recursive: true });
  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    const sourcePath = join(sourceDir, entry.name);
    const targetName = entry.name === 'gitignore' ? '.gitignore' : entry.name;
    const targetPath = join(targetDir, targetName);
    if (entry.isDirectory()) {
      await copyTemplates(sourcePath, targetPath, variables);
    } else if (
      TEXT_EXTENSIONS.some(ext => entry.name.endsWith(ext)) ||
      entry.name === 'gitignore'
    ) {
      const content = await readFile(sourcePath, 'utf8');
      await writeFile(targetPath, substitute(content, variables));
    } else {
      await cp(sourcePath, targetPath);
    }
  }
}

const substitute = (
  content: string,
  variables: Record<string, string>,
): string =>
  content.replace(
    /{{(\w+)}}/g,
    (match, name: string) => variables[name] ?? match,
  );
