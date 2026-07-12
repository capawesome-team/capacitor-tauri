"use strict";
(() => {
  // src/shim/invoke.ts
  function invoke(command, args, options) {
    const internals = window.__TAURI_INTERNALS__;
    if (!internals) {
      return Promise.reject(
        new Error("Tauri IPC is not available. Is this running inside Tauri?")
      );
    }
    return internals.invoke(command, args, options);
  }
  function invokePlugin(pluginName, command, args) {
    return invoke(`plugin:${pluginName}|${command}`, args);
  }

  // src/shim/events.ts
  var EVENT_CHANNEL = "capacitor://event";
  var listeners = /* @__PURE__ */ new Map();
  var key = (plugin, event) => `${plugin}:${event}`;
  var started = false;
  function ensureStarted() {
    if (started) {
      return;
    }
    started = true;
    const internals = window.__TAURI_INTERNALS__;
    if (!internals) {
      return;
    }
    const handler = internals.transformCallback((raw) => {
      const payload = raw.payload;
      if (!payload) {
        return;
      }
      const set = listeners.get(key(payload.plugin, payload.event));
      if (set) {
        for (const listener of set) {
          listener(payload.data);
        }
      }
    });
    void invoke("plugin:event|listen", {
      event: EVENT_CHANNEL,
      target: { kind: "Any" },
      handler
    });
  }
  function addEventListener(plugin, event, callback) {
    ensureStarted();
    const set = listeners.get(key(plugin, event)) ?? /* @__PURE__ */ new Set();
    set.add(callback);
    listeners.set(key(plugin, event), set);
    return {
      remove: async () => {
        set.delete(callback);
      }
    };
  }
  function removeAllEventListeners(plugin) {
    for (const registryKey of [...listeners.keys()]) {
      if (registryKey.startsWith(`${plugin}:`)) {
        listeners.delete(registryKey);
      }
    }
  }

  // src/shim/plugins/app.ts
  var APP_EVENTS = ["appUrlOpen", "appStateChange", "pause", "resume"];
  function registerCoreAppPlugin(register) {
    register("App", {
      async exitApp() {
        await invoke("app_exit");
      },
      async getInfo() {
        const [name, id, version] = await Promise.all([
          invoke("app_get_name"),
          invoke("app_get_identifier"),
          invoke("app_get_version")
        ]);
        return { name, id, build: version, version };
      },
      async getState() {
        return { isActive: document.hasFocus() };
      },
      async getLaunchUrl() {
        const url = await invoke("app_get_launch_url");
        return url ? { url } : void 0;
      },
      addListener(eventName, callback) {
        if (!APP_EVENTS.includes(eventName)) {
          return { remove: async () => void 0 };
        }
        return addEventListener("App", eventName, callback);
      },
      async removeAllListeners() {
        removeAllEventListeners("App");
      }
    });
  }

  // src/shim/plugins/dialog.ts
  var Dialog = {
    async alert(options) {
      await invokePlugin("dialog", "message", {
        message: options.message,
        title: options.title,
        kind: "info",
        buttons: options.buttonTitle ? { OkCustom: options.buttonTitle } : "Ok"
      });
    },
    async confirm(options) {
      const result = await invokePlugin("dialog", "message", {
        message: options.message,
        title: options.title,
        kind: "info",
        buttons: options.okButtonTitle && options.cancelButtonTitle ? {
          OkCancelCustom: [
            options.okButtonTitle,
            options.cancelButtonTitle
          ]
        } : "OkCancel"
      });
      const okLabel = options.okButtonTitle ?? "Ok";
      return { value: result === okLabel || result === "Ok" };
    }
  };

  // src/shim/plugins/filesystem.ts
  var BASE_DIRECTORY = {
    Data: 14,
    // AppData
    Documents: 6,
    // Document
    Cache: 16,
    // AppCache
    External: 14,
    // AppData (no direct equivalent)
    ExternalStorage: 21,
    // Home
    Library: 15
    // AppLocalData
  };
  var toBaseDir = (directory) => directory ? BASE_DIRECTORY[directory] : void 0;
  var decode = (bytes) => new TextDecoder().decode(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : new Uint8Array(bytes)
  );
  var Filesystem = {
    async readFile(options) {
      const bytes = await invokePlugin(
        "fs",
        "read_text_file",
        {
          path: options.path,
          options: { baseDir: toBaseDir(options.directory) }
        }
      );
      return { data: decode(bytes) };
    },
    async writeFile(options) {
      const body = new TextEncoder().encode(options.data);
      await invoke("plugin:fs|write_text_file", body, {
        headers: {
          path: encodeURIComponent(options.path),
          options: JSON.stringify({
            baseDir: toBaseDir(options.directory),
            create: true
          })
        }
      });
      return { uri: options.path };
    },
    async deleteFile(options) {
      await invokePlugin("fs", "remove", {
        path: options.path,
        options: { baseDir: toBaseDir(options.directory) }
      });
    },
    async mkdir(options) {
      await invokePlugin("fs", "mkdir", {
        path: options.path,
        options: {
          baseDir: toBaseDir(options.directory),
          recursive: options.recursive ?? false
        }
      });
    },
    async rmdir(options) {
      await invokePlugin("fs", "remove", {
        path: options.path,
        options: {
          baseDir: toBaseDir(options.directory),
          recursive: options.recursive ?? false
        }
      });
    },
    async readdir(options) {
      const entries = await invokePlugin("fs", "read_dir", {
        path: options.path,
        options: { baseDir: toBaseDir(options.directory) }
      });
      return {
        files: entries.map((entry) => ({
          name: entry.name,
          type: entry.isDirectory ? "directory" : "file"
        }))
      };
    },
    async stat(options) {
      const result = await invokePlugin("fs", "stat", {
        path: options.path,
        options: { baseDir: toBaseDir(options.directory) }
      });
      return {
        type: result.isDirectory ? "directory" : "file",
        size: result.size,
        mtime: result.mtime
      };
    }
  };

  // src/shim/plugins/local-notifications.ts
  var LocalNotifications = {
    async checkPermissions() {
      const granted = await invokePlugin(
        "notification",
        "is_permission_granted"
      );
      return {
        display: granted === true ? "granted" : granted === false ? "denied" : "prompt"
      };
    },
    async requestPermissions() {
      const state = await invokePlugin(
        "notification",
        "request_permission"
      );
      return { display: state === "granted" ? "granted" : "denied" };
    },
    async schedule(options) {
      for (const notification of options.notifications) {
        await invokePlugin("notification", "notify", {
          options: {
            id: notification.id,
            title: notification.title,
            body: notification.body
          }
        });
      }
      return {
        notifications: options.notifications.map(({ id }) => ({ id }))
      };
    }
  };

  // src/shim/plugins/preferences.ts
  var STORE_PATH = "capacitor-preferences.json";
  var ridPromise = null;
  var getRid = () => {
    if (!ridPromise) {
      ridPromise = invokePlugin("store", "load", { path: STORE_PATH });
    }
    return ridPromise;
  };
  var Preferences = {
    async get(options) {
      const rid = await getRid();
      const [value, exists] = await invokePlugin(
        "store",
        "get",
        { rid, key: options.key }
      );
      return { value: exists ? value : null };
    },
    async set(options) {
      const rid = await getRid();
      await invokePlugin("store", "set", {
        rid,
        key: options.key,
        value: options.value
      });
    },
    async remove(options) {
      const rid = await getRid();
      await invokePlugin("store", "delete", { rid, key: options.key });
    },
    async keys() {
      const rid = await getRid();
      const keys = await invokePlugin("store", "keys", { rid });
      return { keys };
    },
    async clear() {
      const rid = await getRid();
      await invokePlugin("store", "clear", { rid });
    }
  };

  // src/shim/plugins/index.ts
  var curatedPlugins = [
    { name: "Filesystem", implementation: Filesystem },
    { name: "Preferences", implementation: Preferences },
    { name: "Dialog", implementation: Dialog },
    { name: "LocalNotifications", implementation: LocalNotifications }
  ];

  // src/shim/index.ts
  (() => {
    const globalWindow = window;
    if (globalWindow.CapacitorCustomPlatform) {
      return;
    }
    const plugins = {};
    const headers = [];
    const register = (name, implementation) => {
      plugins[name] = implementation;
      headers.push({
        name,
        methods: Object.keys(implementation).map((methodName) => ({
          name: methodName,
          rtype: methodName === "addListener" ? "callback" : "promise"
        }))
      });
    };
    registerCoreAppPlugin(register);
    for (const plugin of curatedPlugins) {
      register(plugin.name, plugin.implementation);
    }
    globalWindow.CapacitorCustomPlatform = {
      name: "tauri",
      plugins
    };
    const capacitor = globalWindow.Capacitor ?? {};
    capacitor.PluginHeaders = [...capacitor.PluginHeaders ?? [], ...headers];
    capacitor.nativePromise = (pluginName, methodName, options) => {
      if (methodName === "removeAllListeners") {
        const method2 = plugins[pluginName]?.removeAllListeners;
        return method2 ? method2() : Promise.resolve();
      }
      const method = plugins[pluginName]?.[methodName];
      if (!method) {
        return Promise.reject(
          new Error(
            `"${pluginName}.${methodName}()" is not implemented on tauri.`
          )
        );
      }
      return method(options);
    };
    capacitor.nativeCallback = (pluginName, methodName, options, callback) => {
      if (methodName !== "addListener" || !options?.eventName) {
        return;
      }
      const addListener = plugins[pluginName]?.addListener;
      addListener?.(options.eventName, callback);
    };
    globalWindow.Capacitor = capacitor;
  })();
})();
