import { HOST_API } from "@/environment";

interface SseOption {
  query: Record<string, string>;
}

type Method = "POST" | "PUT" | "PATCH" | "DELETE";
interface SseEmitOption {
  method: Method;
}

type Callback<T> = (data: T) => void;

class Sse {
  private es: EventSource | null = null;
  private listeners: Record<string, Callback<unknown>[]> = {};
  private full_url: string = "";
  private base_url: string = "";

  constructor(url: string, opt?: SseOption) {
    const queries: Record<string, string> = {
      token: localStorage.getItem("token") || "",
    };
    if (opt?.query) Object.assign(queries, opt.query);
    const query = new URLSearchParams(queries);
    this.base_url = url;
    this.full_url = `${HOST_API}${url}?${query.toString()}`;
    this.es = new EventSource(this.full_url);
    this.es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { event: eventName, data } = payload;
        if (eventName && this.listeners[eventName]) {
          this.listeners[eventName].forEach((cb) => cb(data));
        }
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };
  }
  on<T>(event: string, callback: Callback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback as Callback<unknown>);
  }
  off<T>(event: string, callback?: Callback<T>) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    } else {
      delete this.listeners[event];
    }
  }
  emit<T>(event: string, data?: T, opt?: SseEmitOption) {
    if (!opt?.method || opt?.method === ("GET" as unknown as Method)) {
      console.error("Method must be POST");
      return;
    }
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const token = localStorage.getItem("token");
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }

    fetch(this.full_url, {
      method: opt?.method || "POST",
      headers,
      body: JSON.stringify({
        event,
        data,
      }),
    });
  }

  disconnect() {
    if (this.es) {
      this.es.close();
      this.es = null;
    }
    urls.delete(this.base_url);
  }
}

export default Sse;

const urls = new Map<string, Sse>();
export const getSseClient = (url: string, opt?: SseOption): Sse => {
  if (!urls.has(url)) {
    urls.set(url, new Sse(url, opt));
  }
  return urls.get(url)!;
};
