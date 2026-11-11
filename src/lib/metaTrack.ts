declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export async function trackMetaEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  testEventCode?: string
) {
  const eventId = crypto.randomUUID();
  const eventSourceUrl = window.location.href;

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, customData || {}, { eventID: eventId });
  }

  try {
    await fetch('/api/meta-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl,
        customData,
        testEventCode,
      }),
    });
  } catch (err) {
    console.error('Meta server tracking error:', err);
  }
}
