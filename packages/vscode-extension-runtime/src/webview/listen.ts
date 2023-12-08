/**
 *  这部分运行在 webview 中，用于处理从插件侧发送来的消息
 * @param namespace 命名空间
 * @param handlers 回调方法
 */
export const webviewListen = (
  namespace: string,
  handlers: Record<string, Handler>,
) => {
  if (!window.__vscode__) {
    window.__vscode__ = acquireVsCodeApi();
  }

  window.addEventListener('message', (ev: { data: Message }) => {
    // 处理消息，执行回调
    const { id, namespace: ns, name, data } = ev.data;

    if (ns !== namespace) {
      return;
    }

    const handler = handlers[name];
    if (!handler) {
      return;
    }
    const result = handler(data);

    // 发送回调执行结果
    const cbMessage: Message = {
      id,
      namespace,
      name: 'call-back',
      data: result,
    };
    window.__vscode__?.postMessage(cbMessage);
  });
};
