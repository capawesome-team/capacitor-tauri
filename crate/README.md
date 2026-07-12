# capacitor-tauri

Rust runtime for the [Capacitor Tauri platform](https://capawesome.io/docs/sdks/capacitor/tauri/) (`@capawesome/capacitor-tauri`).

This crate is a dependency of the `src-tauri/` project scaffolded by the platform; it is not meant to be used standalone. It provides the single-instance and deep-link wiring, the Capacitor bridge injection, and the built-in `@capacitor/app` commands.

Install the platform via npm instead of adding this crate directly:

```bash
npm install @capawesome/capacitor-tauri
npx cap add @capawesome/capacitor-tauri
```

## License

See [LICENSE](./LICENSE).
