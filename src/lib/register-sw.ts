/**
 * Service Worker registration for PWA
 * Registers SW on page load, handles updates
 */

export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Check for updates periodically
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New version available, will activate on next visit
              console.log("[SW] New version available");
            }
          });
        }
      });

      console.log("[SW] Registered successfully");
    } catch (error) {
      console.error("[SW] Registration failed:", error);
    }
  });
}
