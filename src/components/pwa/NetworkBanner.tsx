"use client";

import { useEffect, useState } from "react";

export function NetworkBanner() {
  const [status, setStatus] = useState(
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
  );

  useEffect(() => {
    const update = () => {
      setStatus(navigator.onLine ? "online" : "offline");
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        textAlign: "center",
        backgroundColor: status === "online" ? "#16a34a" : "#dc2626",
        color: "white",
        padding: "0.5rem",
        zIndex: 60,
      }}
      role="status"
      aria-live="polite"
    >
      {status === "online"
        ? "Online ✅"
        : "Offline — changes will sync later 🔄"}
    </div>
  );
}
