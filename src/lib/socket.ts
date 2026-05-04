import { HOST_API } from "@/environment";

type Callback<T> = (data: T) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Record<string, Callback<unknown>[]> = {};

  connect() {
    if (this.eventSource) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    this.eventSource = new EventSource(
      `${HOST_API}/api/event/stream?token=${token}`,
    );

    this.eventSource.onmessage = (event) => {
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

    this.eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      this.disconnect();
    };
  }

  on<T>(event: string, callback: Callback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback as Callback<unknown>);
    this.connect(); // ensure connected
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

  emit(event: string, data?: unknown) {
    // SSE is unidirectional (Server to Client).
    // Mock emit for legacy code that might still call it (like `socket.emit("join", token)`).
    console.debug(`[SSEClient] Ignored emit for event: ${event}`, data);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const sseClient = new SSEClient();

export function getSocket() {
  return sseClient;
}

export function disconnectSocket(): void {
  sseClient.disconnect();
}
