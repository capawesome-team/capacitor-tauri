import { invokePlugin } from '../invoke';

/**
 * Capacitor Dialog plugin implemented over `tauri-plugin-dialog`. Note the
 * Capacitor Dialog API is prompt/alert/confirm oriented; native file pickers
 * are exposed through the Filesystem/FilePicker plugins on mobile. Here the
 * three Capacitor methods map onto the Tauri message dialog.
 */
export const Dialog = {
  async alert(options: {
    title?: string;
    message: string;
    buttonTitle?: string;
  }): Promise<void> {
    await invokePlugin('dialog', 'message', {
      message: options.message,
      title: options.title,
      kind: 'info',
      buttons: options.buttonTitle ? { OkCustom: options.buttonTitle } : 'Ok',
    });
  },
  async confirm(options: {
    title?: string;
    message: string;
    okButtonTitle?: string;
    cancelButtonTitle?: string;
  }): Promise<{ value: boolean }> {
    const result = await invokePlugin<string>('dialog', 'message', {
      message: options.message,
      title: options.title,
      kind: 'info',
      buttons:
        options.okButtonTitle && options.cancelButtonTitle
          ? {
              OkCancelCustom: [
                options.okButtonTitle,
                options.cancelButtonTitle,
              ],
            }
          : 'OkCancel',
    });
    const okLabel = options.okButtonTitle ?? 'Ok';
    return { value: result === okLabel || result === 'Ok' };
  },
};
