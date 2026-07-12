//! The Capacitor bridge plugin: injects the platform shim into every window
//! before any page script runs, hosts the built-in `@capacitor/app` bridge
//! commands, and forwards deep-link and lifecycle events to the webview.

use serde::Serialize;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{AppHandle, Emitter, Manager, Runtime, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;

/// Compiled platform shim (built from the npm package's TypeScript source
/// and baked into the crate at compile time). Sets up
/// `window.CapacitorCustomPlatform` and the `Capacitor` pre-seed with the
/// curated plugin implementations.
const BRIDGE_SCRIPT: &str = include_str!("bridge.js");

/// Event name the shim listens on for Capacitor core-plugin events.
const EVENT_CHANNEL: &str = "capacitor://event";

#[derive(Clone, Serialize)]
struct CapacitorEvent {
    plugin: &'static str,
    event: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
}

fn emit_event<R: Runtime>(
    app: &AppHandle<R>,
    plugin: &'static str,
    event: &'static str,
    data: Option<serde_json::Value>,
) {
    let _ = app.emit(
        EVENT_CHANNEL,
        CapacitorEvent {
            plugin,
            event,
            data,
        },
    );
}

#[tauri::command]
fn app_exit<R: Runtime>(app: AppHandle<R>) {
    app.exit(0);
}

#[tauri::command]
fn app_get_name<R: Runtime>(app: AppHandle<R>) -> String {
    app.package_info().name.clone()
}

#[tauri::command]
fn app_get_version<R: Runtime>(app: AppHandle<R>) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
fn app_get_identifier<R: Runtime>(app: AppHandle<R>) -> String {
    app.config().identifier.clone()
}

/// Deep link that launched the app (captured at startup), if any.
#[tauri::command]
fn app_get_launch_url<R: Runtime>(app: AppHandle<R>) -> Option<String> {
    app.deep_link()
        .get_current()
        .ok()
        .flatten()
        .and_then(|urls| urls.into_iter().next())
        .map(|url| url.to_string())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("capacitor")
        .js_init_script(BRIDGE_SCRIPT.to_string())
        .invoke_handler(tauri::generate_handler![
            app_exit,
            app_get_name,
            app_get_version,
            app_get_identifier,
            app_get_launch_url
        ])
        .setup(|app, _api| {
            // Register the configured URL schemes at runtime (required for
            // dev/unpackaged apps on Linux and Windows).
            #[cfg(any(target_os = "linux", windows))]
            let _ = app.deep_link().register_all();
            let handle = app.clone();
            // Deep links received while the app is running → appUrlOpen.
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    emit_event(
                        &handle,
                        "App",
                        "appUrlOpen",
                        Some(serde_json::json!({ "url": url.to_string() })),
                    );
                }
            });
            Ok(())
        })
        .on_webview_ready(|webview| {
            // Focus/blur → appStateChange + pause/resume, mirroring mobile.
            let app = webview.app_handle().clone();
            webview.window().on_window_event(move |event| {
                if let WindowEvent::Focused(is_active) = event {
                    emit_event(
                        &app,
                        "App",
                        "appStateChange",
                        Some(serde_json::json!({ "isActive": is_active })),
                    );
                    emit_event(
                        &app,
                        "App",
                        if *is_active { "resume" } else { "pause" },
                        None,
                    );
                }
            });
        })
        .build()
}
