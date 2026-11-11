"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1580985547376513";

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "Search"
  | "Contact";

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// _fbc cookie, or build it from ?fbclid= when the cookie isn't set yet
function getFbc(): string | undefined {
  const cookie = getCookie("_fbc");
  if (cookie) return cookie;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

// fbq is a queue stub as soon as the inline script runs, so wait for it
function whenFbqReady(cb: () => void, tries = 50) {
  if (window.fbq) return cb();
  if (tries <= 0) return;
  setTimeout(() => whenFbqReady(cb, tries - 1), 100);
}

function sendServerEvent(
  eventName: MetaEventName,
  eventId: string,
  customData?: Record<string, unknown>,
  userData?: { email?: string; phone?: string }
) {
  fetch("/api/meta-events", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      fbp: getCookie("_fbp"),
      fbc: getFbc(),
      customData,
      userData, // raw email/phone: hash them (SHA-256, lowercase/trimmed) on the server
    }),
  }).catch((err) => console.error("Meta CAPI error:", err));
}

/**
 * Fire a browser + server event with the SAME event_id (deduplication).
 * Usage: trackMetaEvent("Lead", { content_name: "Get Code" }, { email })
 */
export function trackMetaEvent(
  eventName: MetaEventName,
  customData: Record<string, unknown> = {},
  userData?: { email?: string; phone?: string }
) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  const eventId = crypto.randomUUID();
  whenFbqReady(() =>
    window.fbq!("track", eventName, customData, { eventID: eventId })
  );
  sendServerEvent(eventName, eventId, customData, userData);
  return eventId;
}

export default function MetaPixel() {
  const pathname = usePathname();

  // PageView on first load and on every client-side route change
  useEffect(() => {
    trackMetaEvent("PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){
          n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;
          n.push=n;
          n.loaded=!0;
          n.version='2.0';
          n.queue=[];
          t=b.createElement(e);
          t.async=!0;
          t.src=v;
          s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
          }(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');

          fbq('init', '${PIXEL_ID}');
        `}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}