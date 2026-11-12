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

const track = (name: string, data?: Record<string, unknown>) =>
  window.fbq?.("track", name, data);

/* ---------- Page views + content views on navigation ---------- */
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Base code already fires PageView on the first load
    if (isFirstRender.current) isFirstRender.current = false;
    else track("PageView");

    const category = searchParams.get("category");

    if (pathname.startsWith("/stores/")) {
      track("ViewContent", {
        content_type: "store",
        content_name: decodeURIComponent(pathname.split("/")[2] ?? ""),
      });
    } else if (pathname === "/stores" && category) {
      track("ViewContent", { content_type: "category", content_name: category });
    } else if (pathname === "/coupons" || pathname === "/deals") {
      track("ViewContent", { content_type: "list", content_name: pathname.slice(1) });
    }
  }, [pathname, searchParams]);

  return null;
}



function InteractionTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      const href = link?.getAttribute("href")?.trim() ?? "";

      if (href.startsWith("mailto:") || href.startsWith("tel:")) {
        track("Contact", { method: href.split(":")[0] });
      }
    };

    const onClick = (e: MouseEvent) => {
  const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
  const href = link?.getAttribute("href")?.trim() ?? "";

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    track("Contact", { method: href.split(":")[0] });
  }
};

    const onSubmit = (e: SubmitEvent) => {
      const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>(
        "input[type=search]"
      );
      if (input?.value) track("Search", { search_string: input.value });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
    // const onClick = (e: MouseEvent) => {
    //   const target = e.target as HTMLElement;
    //   const link = target.closest<HTMLAnchorElement>("a[href]");
    //   const button = target.closest<HTMLElement>("button,[role=button]");
    //   const href = link?.getAttribute("href")?.trim() ?? "";

    //   // mailto / tel
    //   if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    //     track("Contact", { method: href.split(":")[0] });
    //     return;
    //   }

    //   // Affiliate / outbound click, or a Get code / Get deal button
    //   let isExternal = false;
    //   let host = "";
    //   try {
    //     const url = new URL(href, window.location.origin);
    //     host = url.hostname;
    //     isExternal = !!href && url.hostname !== window.location.hostname;
    //   } catch {}

    //   const label = (button?.innerText || link?.innerText || "").trim();
    //   if (isExternal || (button && CTA_TEXT.test(label))) {
    //     const card = target.closest("article,li,[class*=card]") as HTMLElement | null;
    //     track("Lead", {
    //       content_name: (card?.innerText || label).split("\n").filter(Boolean).slice(0, 2).join(" | ").slice(0, 100),
    //       content_category: window.location.pathname.split("/")[1] || "home",
    //       destination: host,
    //       cta: label.replace(/\s+/g, " ").slice(0, 30),
    //     });
    //   }
    // };

    const onSubmit = (e: SubmitEvent) => {
      const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>(
        "input[type=search]"
      );
      if (input?.value) track("Search", { search_string: input.value });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
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
      <InteractionTracker />
    </>
  );
}