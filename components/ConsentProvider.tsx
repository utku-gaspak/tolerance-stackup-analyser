"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ConsentChoice } from "../lib/consent";
import { readStoredConsent, writeStoredConsent } from "../lib/consent";

interface ConsentContextValue {
  consent: ConsentChoice | null;
  isBannerOpen: boolean;
  openConsentBanner: () => void;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    setConsent(storedConsent);
    setIsBannerOpen(storedConsent === null);
  }, []);

  const openConsentBanner = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  const acceptAnalytics = useCallback(() => {
    writeStoredConsent("granted");
    setConsent("granted");
    setIsBannerOpen(false);
  }, []);

  const rejectAnalytics = useCallback(() => {
    writeStoredConsent("denied");
    setConsent("denied");
    setIsBannerOpen(false);
  }, []);

  const value = useMemo(
    () => ({ consent, isBannerOpen, openConsentBanner, acceptAnalytics, rejectAnalytics }),
    [consent, isBannerOpen, openConsentBanner, acceptAnalytics, rejectAnalytics]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }

  return context;
}
