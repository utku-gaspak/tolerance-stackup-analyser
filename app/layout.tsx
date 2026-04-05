import type { Metadata } from "next";
import Script from "next/script";
import { AnalyticsGate } from "../components/AnalyticsGate";
import { ConsentBanner } from "../components/ConsentBanner";
import { ConsentProvider } from "../components/ConsentProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tolerance Stackup Analysis",
  description: "Engineering-focused 1D tolerance stackup calculator"
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {gaId ? (
          <Script id="ga-consent-defaults" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              window['ga-disable-${gaId}'] = true;
            `}
          </Script>
        ) : null}
        <ConsentProvider>
          {children}
          <AnalyticsGate gaId={gaId ?? null} />
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
