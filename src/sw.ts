/// <reference lib="webworker" />
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST);

// Tambahkan manual file statis
const denylistFiles = [
  "/notification.mp3",
  "/model.json",
  "/group1-shard1of1.bin",
];
precacheAndRoute(
  denylistFiles.map((url) => ({
    url,
    revision: null,
  })),
);

// Cache icons- files
registerRoute(
  ({ url }) => url.pathname.startsWith("/assets/icons-"),
  new CacheFirst({
    cacheName: "icons-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

// clean old assets
cleanupOutdatedCaches();

// Define a denylist to exclude /api* routes from the navigation fallback
// "/api/", "/socket.io", "/ws", "/subscribe", "/icon", "/file", "/upload", "/webhook", "/swagger", "/swagger.json"
const denylist = [
  "/api",
  "/socket.io",
  "/ws",
  "/subscribe",
  "/icon",
  "/file",
  "/upload",
  "/webhook",
  "/sitemap.xml",
  "/robots.txt",
  "/swagger",
  "/swagger.json",
  // jokes
  "/_next",
  ...denylistFiles,
];
const denylistRegex = denylist.map((path) => new RegExp(`^${path}`));

// Allowlist in dev mode (optional)
let allowlist: RegExp[] | undefined;
if (import.meta.env.DEV) allowlist = [/^\/$/];

// Register navigation route with denylist for /api*
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), {
    denylist: denylistRegex,
    allowlist,
  }),
);

// Avoid caching for /api* endpoints
registerRoute(
  ({ url }) => denylist.some((path) => url.pathname.startsWith(path)),
  new NetworkOnly(),
);

// Register Cache khusus files
denylistFiles.forEach((url_path) => {
  registerRoute(
    ({ url }) => url.pathname === url_path,
    new CacheFirst({
      cacheName: url_path,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
      ],
    }),
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received");

  // Log raw data for debugging
  if (event.data) {
    const rawData = event.data.text();
    console.log("Raw push data:", rawData);

    // Define interface for notification data
    interface NotificationData {
      title?: string;
      body?: string;
      icon?: string;
      url?: string;
      [key: string]: unknown;
    }

    // Try to parse the data safely
    let data: NotificationData = {};
    try {
      data = JSON.parse(rawData) as NotificationData;
      console.log("Parsed push data:", data);
    } catch (error) {
      console.log("Error parsing push data:", error);
      data = { title: "Notifikasi Baru", body: rawData };
    }

    const title = data.title || "Notifikasi Baru";
    const options: NotificationOptions = {
      body: data?.body || "Anda punya pesan baru",
      icon: data?.icon || "/favicon.svg", // Make sure this file exists
      badge: data?.icon || "/favicon.svg", // Make sure this file exists
      data: data?.url || "/",
      // Add more options for better notifications
      // vibrate: [100, 50, 100],
      // timestamp: Date.now(),
      requireInteraction: true,
    };

    // Make sure we have permission before showing notification
    event.waitUntil(
      self.registration.showNotification(title, options).catch((error) => {
        console.error("Error showing notification:", error);
        // Check if we have permission
        if (Notification.permission !== "granted") {
          console.error("Notification permission not granted");
        }
      }),
    );
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "PLAY_AUDIO" }));
    });
  } else {
    console.log("Push event received but no data");
  }
});

self.addEventListener("notificationclick", (event) => {
  // Close the notification
  event.notification.close();

  // Get the URL from notification data
  const url = event.notification.data || "/";

  // Handle navigation
  event.waitUntil(
    // First try to find if there's an existing window/tab to focus
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList: readonly WindowClient[]) => {
        // Check if there is already a window/tab open with the target URL
        for (const client of clientList) {
          const urlObj = new URL(url.toString(), self.location.origin);
          if (client.url.includes(urlObj.pathname) && "focus" in client) {
            // If we find it, just focus it
            return client.focus();
          }
        }

        // If not found, open a new window/tab
        return self.clients.openWindow(url.toString());
      }),
  );
});
