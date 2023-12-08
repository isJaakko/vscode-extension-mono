import * as vscode from 'vscode';
import EventEmitter from 'events';

/**
 * 这部分代码运行在 vscode 里
 * @param namespace
 */
export const createWebviewCaller = <T extends Record<string, Handler>>(
  namespace: string,
  webview: vscode.Webview,
  config?: { timeout?: number },
) => {
  const emitter = new EventEmitter();

  // 监听对面回调
  webview.onDidReceiveMessage((message: Message) => {
    const { id, name, data, namespace: ns } = message;

    if (ns !== namespace) {
      return;
    }

    if (name !== 'call-back') {
      return;
    }

    emitter.emit(id, data);
  });

  return new Proxy<Caller<T>>({} as Caller<T>, {
    /**
     * @param property 期望执行的 webview 侧回调方法
     */
    get: (_target, property: string) => () => {
      // 发送消息
      const id = Date.now().toString(32);
      const message: Message = {
        id,
        namespace,
        name: property,
        data: {},
      };
      webview.postMessage(message);

      // 等待回调
      const result = new Promise(resolve => {
        emitter.once(id, (...response) => {
          resolve(response);
        });
      });
      const timeout = new Promise(resolve =>
        setTimeout(resolve, config?.timeout ?? 10000),
      );

      return Promise.race([result, timeout]);
    },
  });
};
