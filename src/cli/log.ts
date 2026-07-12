const PREFIX = '[capacitor-tauri]';

export const logInfo = (message: string): void => {
  console.log(`${PREFIX} ${message}`);
};

export const logWarn = (message: string): void => {
  console.warn(`${PREFIX} WARN: ${message}`);
};

export const fail = (message: string): never => {
  console.error(`${PREFIX} ERROR: ${message}`);
  process.exit(1);
};
