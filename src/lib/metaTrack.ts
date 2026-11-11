declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(
  eventName: string,
  customData?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const eventId = crypto.randomUUID();
  const eventSourceUrl = window.location.href;

  // 1. Fire Browser Pixel with matching eventID
  if (window.fbq) {
    window.fbq("track", eventName, customData || {}, { eventID: eventId });
  }

  // 2. Fire Server CAPI via your /api/meta-events route
  fetch("/api/meta-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl,
      customData,
    }),
  }).catch((err) => console.error("Meta CAPI tracking error:", err));
}
