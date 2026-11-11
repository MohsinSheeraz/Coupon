"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.META_PIXEL_ID || "1580985547376513";

export default function MetaPixel() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Skip the very first render because the inline <Script> below already fires the initial PageView
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
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
          fbq('track', 'PageView');
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
