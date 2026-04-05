"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GOOGLE_CONSENT_DEFAULTS } from "../lib/consent";
import { useConsent } from "./ConsentProvider";

export function AnalyticsGate({ gaId }: { gaId: string | null }) {
  const { consent } = useConsent();

  useEffect(() => {
    if (!gaId || typeof window === "undefined") {
      return;
    }

    const gaWindow = window as unknown as {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      [key: string]: boolean | unknown[] | ((...args: unknown[]) => void) | undefined;
    };
    gaWindow[`ga-disable-${gaId}`] = consent !== "granted";

    if (typeof gaWindow.gtag === "function") {
      gaWindow.gtag(
        "consent",
        "update",
        consent === "granted"
          ? {
              analytics_storage: "granted",
              ad_storage: "denied",
              ad_user_data: "denied",
              ad_personalization: "denied"
            }
          : GOOGLE_CONSENT_DEFAULTS
      );
    }
  }, [gaId, consent]);

  if (!gaId || consent !== "granted") {
    return null;
  }

  return (
    <>
      <Script id="ga-loader" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
