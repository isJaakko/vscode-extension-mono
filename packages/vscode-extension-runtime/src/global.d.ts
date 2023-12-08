interface Message {
  /**
   * 消息唯一标识，时间戳转换为字符
   */
  id: string;
  /**
   * 命名空间
   */
  namespace: string;
  /**
   * 消息名称，通常对应处理该消息的回调函数名称，如果为处理完消息后向对方发送的消息，则该值为 'call-back'
   */
  name: string;
  /**
   * 消息数据
   */
  data: unknown;
}

type Handler = (...p: any[]) => unknown | undefined;

type Caller<T extends Record<string, Handler>> = {
  [K in keyof T]: (...params: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};

interface VsCodeApi {
  postMessage: (msg: unknown) => void;
}

declare const acquireVsCodeApi: () => VsCodeApi;
declare interface Window {
  __vscode__?: VsCodeApi;
}
