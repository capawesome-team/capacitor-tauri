import { invokePlugin } from '../invoke';

interface NotificationSchema {
  id: number;
  title: string;
  body?: string;
}

/**
 * Capacitor LocalNotifications plugin implemented over
 * `tauri-plugin-notification`. Scheduling is desktop-immediate only —
 * Tauri's desktop notifications don't support scheduling (a documented
 * limitation); scheduled notifications fire immediately.
 */
export const LocalNotifications = {
  async checkPermissions(): Promise<{ display: string }> {
    const granted = await invokePlugin<boolean | null>(
      'notification',
      'is_permission_granted',
    );
    return {
      display:
        granted === true ? 'granted' : granted === false ? 'denied' : 'prompt',
    };
  },
  async requestPermissions(): Promise<{ display: string }> {
    const state = await invokePlugin<string>(
      'notification',
      'request_permission',
    );
    return { display: state === 'granted' ? 'granted' : 'denied' };
  },
  async schedule(options: {
    notifications: NotificationSchema[];
  }): Promise<{ notifications: { id: number }[] }> {
    for (const notification of options.notifications) {
      await invokePlugin('notification', 'notify', {
        options: {
          id: notification.id,
          title: notification.title,
          body: notification.body,
        },
      });
    }
    return {
      notifications: options.notifications.map(({ id }) => ({ id })),
    };
  },
};
