# Capacitor Tauri Platform

Capacitor platform to build, run, and package lean, secure desktop apps for macOS, Windows, and Linux with Tauri.[^1]

<div class="capawesome-z29o10a">
  <a href="https://capawesome.io/" target="_blank">
    <img alt="Deliver Live Updates to your Capacitor app with Capawesome Cloud" src="https://capawesome.io/assets/banners/cloud-build-and-deploy-capacitor-apps.png?t=1" />
  </a>
</div>

## Features

The Capacitor Tauri platform brings your web app to the desktop with tiny binaries and a security-first Rust core. Here are some of the key features:

- 🪶 **Tiny binaries**: System-webview apps are a few megabytes instead of the ~100 MB an embedded browser needs.
- 🔒 **Security-first**: A Rust core with deny-by-default permissions; capabilities are generated with the minimum grants your plugins need.
- ⚡ **Familiar workflow**: `cap add`, `cap sync`, `cap run` — the same commands as iOS and Android.
- 🧩 **Curated plugins**: Ready-made implementations of core Capacitor plugins on top of official `tauri-plugin-*` crates.
- 🕸️ **Web plugins run free**: Any Capacitor plugin with a web implementation works via automatic fallback.
- 🔗 **Deep links**: Custom URL schemes delivered through the standard `@capacitor/app` `appUrlOpen` event.
- 📱 **App lifecycle**: `appStateChange`, `pause`, and `resume` events, exactly like on mobile.
- ♻️ **Live reload**: Develop against your web dev server with full HMR.
- 📦 **Packaging**: Native installers (`.dmg`, `.msi`/`.exe`, `.deb`/`.AppImage`) via Tauri's bundler.
- 🧩 **Minimal scaffold**: You own a thin `src-tauri/`; all runtime logic ships in the crate and updates via `cargo update`.
- 🔁 **Up-to-date**: Always supports the latest Capacitor and Tauri versions.
- ⭐️ **Support**: Priority support from the Capawesome Team.
- ✨ **Handcrafted**: Built from the ground up with care and expertise, not forked or AI-generated.

Missing a feature? Just [open an issue](https://github.com/capawesome-team/capacitor-tauri/issues) and we'll take a look!

## Electron or Tauri?

This platform is a **complement** to the [Capacitor Electron platform](https://capawesome.io/docs/sdks/capacitor/electron/), not a replacement. Pick based on your priorities:

| | **Tauri** (this platform) | **Electron** |
| --- | --- | --- |
| Binary size | ~3–10 MB | ~80–150 MB |
| Webview | System (WKWebView / WebView2 / WebKitGTK) | Bundled Chromium |
| Plugin story | Web impls + curated shims + bespoke Rust | The full Capacitor plugin ecosystem (any `electron` impl) |
| Web-bundle OTA | Not available | Available |

Choose **Tauri** for lean, secure, kiosk-style and consumer apps. Choose **Electron** for plugin-heavy or OTA-dependent apps.

## Use Cases

The Tauri platform is typically used to bring an existing Capacitor app to the desktop with a minimal footprint, for example:

- **Lean consumer desktop apps**: Ship a few-megabyte installer instead of a hundred-megabyte one.
- **Security-sensitive tools**: Rely on a Rust core with deny-by-default, per-plugin permissions.
- **Kiosk and point-of-sale apps**: Run your web app full screen on dedicated hardware.
- **Internal business tools**: Distribute directly to your team without app stores.

## Compatibility

| Platform Version | Capacitor Version | Tauri Version | Status         |
| ---------------- | ----------------- | ------------- | -------------- |
| 0.x              | >=8.x.x           | >=2.x.x       | Active support |

## Guides

- [Capacitor Tauri Platform: Lean Desktop Apps](https://capawesome.io/blog/announcing-the-capacitor-tauri-platform/)

## Supported Plugins

The plugin story has three tiers (see [Honest Limitations](#honest-limitations)):

| Plugin | Tier | Backed by |
| --- | --- | --- |
| [`@capacitor/app`](https://capacitorjs.com/docs/apis/app) | Built-in | The platform crate + deep-link plugin |
| [`@capacitor/filesystem`](https://capacitorjs.com/docs/apis/filesystem) | Curated | `tauri-plugin-fs` |
| [`@capacitor/preferences`](https://capacitorjs.com/docs/apis/preferences) | Curated | `tauri-plugin-store` |
| [`@capacitor/dialog`](https://capacitorjs.com/docs/apis/dialog) | Curated | `tauri-plugin-dialog` |
| [`@capacitor/local-notifications`](https://capacitorjs.com/docs/apis/local-notifications) | Curated | `tauri-plugin-notification` |
| Plugins with a web implementation | Web fallback | The plugin's own `web` implementation |

Plugins that require native functionality beyond the curated set need a bespoke Rust implementation. Want your favorite plugin curated? Just [open an issue](https://github.com/capawesome-team/capacitor-tauri/issues).

## Prerequisites

Tauri requires the **Rust toolchain** and your platform's system dependencies. Follow the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/) before installing.

## Installation

You can use our **AI-Assisted Setup** to add the platform.
Add the [Capawesome Skills](https://github.com/capawesome-team/skills) to your AI tool using the following command:

```bash
npx skills add capawesome-team/skills --skill capacitor-platforms
```

Then use the following prompt:

```
Use the `capacitor-platforms` skill from `capawesome-team/skills` to add the `@capawesome/capacitor-tauri` platform to my project.
```

If you prefer **Manual Setup**, add the platform by running the following commands:

```bash
npm install @capawesome/capacitor-tauri
npx cap add @capawesome/capacitor-tauri
```

> [!NOTE]
> Always use the full package name with Capacitor CLI commands (e.g. `npx cap sync @capawesome/capacitor-tauri`). A bare `npx cap sync tauri` does nothing.

The scaffolded `src-tauri/` project contains only files you own:

| File | Purpose |
| --- | --- |
| `src/main.rs` | ~3 lines: starts the app via the platform crate |
| `tauri.conf.json` | App configuration (window, CSP, deep links, bundle) |
| `capabilities/` | Permission grants (regenerated at sync) |
| `Cargo.toml` | Crate dependencies (curated plugin crates added at sync) |
| `icons/` | App icons |

Everything with logic lives in the `capacitor-tauri` crate and updates via `cargo update` — your `src-tauri/` never rots.

## Usage

```bash
# Copy web assets + generate capabilities and plugin registrations
npx cap sync @capawesome/capacitor-tauri

# Run the app (uses server.url for live reload when configured)
npx cap run @capawesome/capacitor-tauri
```

At sync time the platform scans your Capacitor plugin dependencies, generates a deny-by-default capability file with only the permissions the enabled curated plugins need, and wires the matching `tauri-plugin-*` crates into your project.

### Live Reload

Set `server.url` in your Capacitor config to your dev server, then run `npx cap run @capawesome/capacitor-tauri` — it launches `tauri dev` pointing at your dev server with full HMR.

### Deep Links

Declare the scheme in `src-tauri/tauri.conf.json` (`plugins.deep-link.desktop.schemes`) and listen with the standard `@capacitor/app` plugin:

```typescript
import { App } from '@capacitor/app';

await App.addListener('appUrlOpen', ({ url }) => {
  console.log('App opened with URL:', url);
});
```

## Packaging

Sync first, then run Tauri's bundler from your project root:

```bash
npx cap sync @capawesome/capacitor-tauri
npx tauri build
```

Tauri's bundler produces native installers for the current OS (`.dmg`/`.app`, `.msi`/`.exe`, `.deb`/`.AppImage`). Signing, updater, and target configuration live in `src-tauri/tauri.conf.json` — see the [Tauri distribution guide](https://v2.tauri.app/distribute/).

## Desktop Patterns

Tauri natively supports a few common desktop behaviors. These are recipes you add in your own `src-tauri/`, not platform features — the platform stays out of your way.

### Start Hidden

To launch without flashing an empty window (for tray-style or splash-first apps), mark the main window as hidden in `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{ "label": "main", "visible": false }]
  }
}
```

Show it from your frontend once your app is ready, or from a tray menu (see below):

```typescript
import { getCurrentWindow } from '@tauri-apps/api/window';

await getCurrentWindow().show();
```

When the user relaunches the app, the platform automatically unminimizes, shows, and focuses the existing `main` window instead of starting a second instance.

### Tray Icon

Switch your `src-tauri/src/main.rs` from `run` to `builder(...)`, which returns the preconfigured `tauri::Builder` so you can add a `.setup(...)` hook before starting the app:

```rust
mod generated;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

fn main() {
    capacitor_tauri::builder(generated::register_plugins)
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &hide, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().expect("window icon is configured in tauri.conf.json").clone())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

The example reuses the app's window icon for the tray, which requires the `icon` entries in `tauri.conf.json` (the scaffold configures them by default).

The tray API needs the `tray-icon` feature on Tauri in `src-tauri/Cargo.toml`:

```toml
tauri = { version = "2", features = ["tray-icon"] }
```

### Splash Screen

Add a second `splashscreen` window alongside the (hidden) `main` window in `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [
      { "label": "main", "visible": false },
      { "label": "splashscreen", "url": "splashscreen.html", "width": 400, "height": 300 }
    ]
  }
}
```

Ship a `splashscreen.html` in your web assets, then close the splash and reveal the main window from your frontend once your app has booted:

```typescript
import { getCurrentWindow, Window } from '@tauri-apps/api/window';

await Window.getByLabel('splashscreen').then((splash) => splash?.close());
await getCurrentWindow().show();
```

## Honest Limitations

Read this before choosing Tauri — these are inherent trade-offs, not bugs:

1. **No plugin-ecosystem reuse.** Tauri's core is Rust; there is no Node.js runtime. Only Tier-1 web implementations, the curated Tier-2 shims, and bespoke Tier-3 Rust plugins work. Arbitrary Capacitor native plugins do **not** run. This is the main reason to choose the [Electron platform](https://capawesome.io/docs/sdks/capacitor/electron/) instead.
2. **Three webview engines.** WKWebView (macOS), WebView2 (Windows), and WebKitGTK (Linux) behave differently — a real cross-engine testing burden, worst on Linux. Electron's single bundled Chromium is more predictable.
3. **No web-bundle OTA.** Web assets are compiled into the binary; there is no Live Update / over-the-air web-bundle mechanism. Only full signed binary updates (via `tauri-plugin-updater`) are possible.
4. **Rust toolchain required.** Developers and CI need Rust and platform system dependencies installed, with longer first builds and large `target/` directories.

## FAQ

### Can I use any Capacitor plugin?

Only plugins with a web implementation, a curated Tier-2 shim, or a bespoke Tauri implementation (see [Supported Plugins](#supported-plugins)). If you need the full plugin ecosystem, use the [Electron platform](https://capawesome.io/docs/sdks/capacitor/electron/).

### Does `Capacitor.getPlatform()` return `tauri`?

Yes. `Capacitor.getPlatform()` returns `'tauri'` and `Capacitor.isNativePlatform()` returns `true`.

### Does this support over-the-air updates?

Not for web bundles. Tauri compiles the web assets into the binary; only full signed binary updates are supported.

## Related

- [Capacitor Electron platform](https://capawesome.io/docs/sdks/capacitor/electron/) — maximum compatibility and web-bundle OTA, with larger binaries.

## Newsletter

Stay up to date with the latest news and updates about the Capawesome, Capacitor, and Ionic ecosystem by subscribing to our [Capawesome Newsletter](https://capawesome.io/newsletter/).

## Changelog

See [CHANGELOG.md](https://github.com/capawesome-team/capacitor-tauri/blob/main/CHANGELOG.md).

## License

See [LICENSE](https://github.com/capawesome-team/capacitor-tauri/blob/main/LICENSE).

[^1]: This project is not affiliated with, endorsed by, sponsored by, or approved by the Tauri Programme within the Commons Conservancy. `Tauri` is a trademark of the Tauri Programme within the Commons Conservancy.
