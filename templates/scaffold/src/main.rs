// Prevents an additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod generated;

fn main() {
    capacitor_tauri::run(tauri::generate_context!(), generated::register_plugins);
}
