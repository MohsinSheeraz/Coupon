"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1580985547376513";

function sendServerPageView(eventId: string) {
  fetch("/api/meta-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName: "PageView",
      eventId,
      eventSourceUrl: window.location.href,
    }),
  }).catch((err) => console.error("Meta CAPI PageView error:", err));
}

export default function MetaPixel() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const eventId = crypto.randomUUID();

    // First load: the inline <Script> initializes fbq; fire both browser & server with the same eventId
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "PageView", {}, { eventID: eventId });
      }
      sendServerPageView(eventId);
      return;
    }

    // Subsequent Next.js route changes
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView", {}, { eventID: eventId });
    }
    sendServerPageView(eventId);
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
          'https://facebook.net');

          fbq('init', '${PIXEL_ID}');
        `}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://facebook.com{PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
