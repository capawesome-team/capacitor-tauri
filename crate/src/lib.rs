//! Capacitor platform runtime for Tauri apps.
//!
//! The user-owned `src-tauri/src/main.rs` stays minimal:
//!
//! ```ignore
//! mod generated;
//!
//! fn main() {
//!     capacitor_tauri::run(tauri::generate_context!(), generated::register_plugins);
//! }
//! ```
//!
//! `generate_context!` must be invoked in the app crate (it reads the app's
//! `tauri.conf.json`), and `generated.rs` is regenerated at `cap sync` from
//! the enabled curated plugins. Everything with logic lives in this crate and
//! updates with it; the app owns only its configuration and the thin
//! `main.rs`.

mod bridge;

use tauri::{Builder, Context, Manager, Wry};

/// Registers the app's curated plugin crates on the builder. Provided by the
/// generated `register_plugins` function.
pub type PluginRegistration = fn(Builder<Wry>) -> Builder<Wry>;

/// Runs a Capacitor Tauri app with the platform defaults: single-instance
/// enforcement, deep-link routing, the Capacitor bridge, and the curated
/// plugins selected at sync time.
pub fn run(context: Context, register_plugins: PluginRegistration) {
    builder(register_plugins)
        .run(context)
        .expect("error while running tauri application");
}

/// The preconfigured [`tauri::Builder`]. Use this instead of [`run`] to
/// register additional plugins or hooks before starting the app.
pub fn builder(register_plugins: PluginRegistration) -> Builder<Wry> {
    let builder = Builder::default();
    // The single-instance plugin must be registered first. Its `deep-link`
    // feature forwards deep links from the relaunch to the running instance on
    // its own; the callback only has to raise the existing window.
    #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
        }
    }));
    let builder = builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(bridge::init());
    register_plugins(builder)
}
