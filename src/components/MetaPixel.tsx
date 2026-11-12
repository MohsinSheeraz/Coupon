"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

export const FB_PIXEL_ID = "1580985547376513";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/* ---------- Optional helper: use anywhere if you ever need it ---------- */
export const trackEvent = (name: string, data?: Record<string, unknown>) => {
  window.fbq?.("track", name, data);
};

/* ---------- Route-based events: edit these to match your URLs ---------- */
const ROUTE_EVENTS: Record<
  string,
  { name: string; data?: Record<string, unknown> }
> = {
  "/thank-you": { name: "Lead" },
  "/checkout": { name: "InitiateCheckout" },
  "/order-success": { name: "Purchase", data: { currency: "USD" } },
};

/* ---------- PageView + route-based events on navigation ---------- */
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The base code already fires PageView on the initial load,
    // so skip it on the first render to avoid a duplicate.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      window.fbq?.("track", "PageView");
    }

    const event = ROUTE_EVENTS[pathname];
    if (event) window.fbq?.("track", event.name, event.data);
  }, [pathname, searchParams]);

  return null;
}

/* ---------- Click-based events: add data-fb-event="EventName" to any element ---------- */
function ClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-fb-event]"
      );
      if (!el?.dataset.fbEvent) return;
      window.fbq?.("track", el.dataset.fbEvent);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}

/* ---------- Main component ---------- */
export default function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
      <ClickTracker />
    </>
  );
}