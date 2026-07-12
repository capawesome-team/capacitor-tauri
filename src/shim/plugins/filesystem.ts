import { invoke, invokePlugin } from '../invoke';

// Capacitor `Directory` → Tauri `BaseDirectory` (numeric enum).
const BASE_DIRECTORY: Record<string, number> = {
  Data: 14, // AppData
  Documents: 6, // Document
  Cache: 16, // AppCache
  External: 14, // AppData (no direct equivalent)
  ExternalStorage: 21, // Home
  Library: 15, // AppLocalData
};

const toBaseDir = (directory?: string): number | undefined =>
  directory ? BASE_DIRECTORY[directory] : undefined;

const decode = (bytes: ArrayBuffer | number[]): string =>
  new TextDecoder().decode(
    bytes instanceof ArrayBuffer
      ? new Uint8Array(bytes)
      : new Uint8Array(bytes),
  );

interface FileOptions {
  path: string;
  directory?: string;
}

/**
 * Capacitor Filesystem plugin implemented over `tauri-plugin-fs`. Covers the
 * common file operations; encoding is UTF-8 text (Capacitor's default) —
 * base64 binary handling is intentionally out of the MVP.
 */
export const Filesystem = {
  async readFile(options: FileOptions): Promise<{ data: string }> {
    const bytes = await invokePlugin<ArrayBuffer | number[]>(
      'fs',
      'read_text_file',
      {
        path: options.path,
        options: { baseDir: toBaseDir(options.directory) },
      },
    );
    return { data: decode(bytes) };
  },
  async writeFile(
    options: FileOptions & { data: string; recursive?: boolean },
  ): Promise<{ uri: string }> {
    const body = new TextEncoder().encode(options.data);
    await invoke('plugin:fs|write_text_file', body, {
      headers: {
        path: encodeURIComponent(options.path),
        options: JSON.stringify({
          baseDir: toBaseDir(options.directory),
          create: true,
        }),
      },
    });
    return { uri: options.path };
  },
  async deleteFile(options: FileOptions): Promise<void> {
    await invokePlugin('fs', 'remove', {
      path: options.path,
      options: { baseDir: toBaseDir(options.directory) },
    });
  },
  async mkdir(options: FileOptions & { recursive?: boolean }): Promise<void> {
    await invokePlugin('fs', 'mkdir', {
      path: options.path,
      options: {
        baseDir: toBaseDir(options.directory),
        recursive: options.recursive ?? false,
      },
    });
  },
  async rmdir(options: FileOptions & { recursive?: boolean }): Promise<void> {
    await invokePlugin('fs', 'remove', {
      path: options.path,
      options: {
        baseDir: toBaseDir(options.directory),
        recursive: options.recursive ?? false,
      },
    });
  },
  async readdir(
    options: FileOptions,
  ): Promise<{ files: { name: string; type: 'file' | 'directory' }[] }> {
    const entries = await invokePlugin<
      { name: string; isDirectory: boolean }[]
    >('fs', 'read_dir', {
      path: options.path,
      options: { baseDir: toBaseDir(options.directory) },
    });
    return {
      files: entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory ? 'directory' : 'file',
      })),
    };
  },
  async stat(options: FileOptions): Promise<{
    type: 'file' | 'directory';
    size: number;
    mtime: number | null;
  }> {
    const result = await invokePlugin<{
      isDirectory: boolean;
      size: number;
      mtime: number | null;
    }>('fs', 'stat', {
      path: options.path,
      options: { baseDir: toBaseDir(options.directory) },
    });
    return {
      type: result.isDirectory ? 'directory' : 'file',
      size: result.size,
      mtime: result.mtime,
    };
  },
};
