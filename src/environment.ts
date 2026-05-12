export const env = import.meta.env as Record<string, string>;
export let HOST_API = env.VITE_HOST_API || "";
if (window.location.hostname.includes("devtunnels.ms")) {
  HOST_API = "https://t7wxxqtb-1234.asse.devtunnels.ms";
}
if (window.location.hostname.includes("localhost")) {
  HOST_API = "http://localhost:3000";
}
if (window.location.hostname.includes("192.168.")) {
  HOST_API = `${window.location.protocol}//${window.location.hostname}:3000`;
}

export const VITE_SECRET = env.VITE_SECRET || "-";
