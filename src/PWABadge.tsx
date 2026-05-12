import { Fragment } from "react/jsx-runtime";

import { useRegisterSW } from "virtual:pwa-register/react";

import "@/PWABadge.css";

function PWABadge() {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [_offlineReady, _setOfflineReady],
    needRefresh: [needRefresh, _setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      const registration = r as unknown as ServiceWorkerRegistration;
      if (registration.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, registration);
      } else if (registration.installing) {
        registration.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated")
            registerPeriodicSync(period, swUrl, registration);
        });
      }
    },
  });

  // function close() {
  //   setOfflineReady(false);
  //   setNeedRefresh(false);
  // }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      {needRefresh && (
        <div className="PWABadge-toast">
          <div className="PWABadge-message">
            <span id="toast-message">
              New content available, click on reload button to update.
              {(() => {
                updateServiceWorker(true);
                return <Fragment></Fragment>;
              })()}
            </span>
          </div>
          {/* <div className="PWABadge-buttons">
            <button
              className="PWABadge-toast-button"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
            <button className="PWABadge-toast-button" onClick={() => close()}>
              Close
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp.status === 200) await r.update();
  }, period);
}
