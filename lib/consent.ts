export type ConsentChoice = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "tolstackup_consent_v1";

export const GOOGLE_CONSENT_DEFAULTS = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
} as const;

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function writeStoredConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
}
