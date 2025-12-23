"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

/**
 * Client component that registers service worker on mount
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
