# Example app

Vite web app + the scaffolded `src-tauri/` project, used by the CI build
matrix and the WebDriver e2e. Exercises the built-in `App` plugin, a Tier-2
curated plugin (`Preferences` → `tauri-plugin-store`), and a Tier-1 plugin
(`Device`) running via automatic web fallback.

The `src-tauri/` project uses a path dependency on the local crate; scaffolded
user projects use the published `capacitor-tauri` crate instead.

## Setup

```bash
npm install
```

## Run

```bash
npm run build && npm run sync
npx cap run @capawesome/capacitor-tauri
```

## E2E (built app)

```bash
npm run e2e:prepare   # vite build + cap sync + cargo build --release
npm run e2e           # tauri-driver + WebdriverIO (Linux/Windows only)
```
