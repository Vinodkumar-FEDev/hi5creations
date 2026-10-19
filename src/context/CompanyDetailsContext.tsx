"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CompanyDetails,
  DEFAULT_COMPANY_DETAILS,
  formatTelLink,
  formatWhatsAppLink,
} from "@/src/data/companyDetails";

const STORAGE_KEY = "hi5_company_details";
const BROADCAST_CHANNEL = "hi5_company_details_sync";

interface CompanyDetailsContextType {
  details: CompanyDetails;
  loading: boolean;
  telPrimary: string;
  telSecondary: string | null;
  whatsappUrl: string;
  getWhatsAppUrlWithText: (customText?: string) => string;
  refreshDetails: () => Promise<void>;
  updateCompanyDetails: (newDetails: CompanyDetails) => Promise<{ success: boolean; error?: string }>;
}

const CompanyDetailsContext = createContext<CompanyDetailsContextType>({
  details: DEFAULT_COMPANY_DETAILS,
  loading: false,
  telPrimary: formatTelLink(DEFAULT_COMPANY_DETAILS.primaryPhone),
  telSecondary: DEFAULT_COMPANY_DETAILS.secondaryPhone
    ? formatTelLink(DEFAULT_COMPANY_DETAILS.secondaryPhone)
    : null,
  whatsappUrl: formatWhatsAppLink(DEFAULT_COMPANY_DETAILS.primaryPhone),
  getWhatsAppUrlWithText: (customText?: string) =>
    formatWhatsAppLink(DEFAULT_COMPANY_DETAILS.primaryPhone, customText),
  refreshDetails: async () => {},
  updateCompanyDetails: async () => ({ success: false }),
});

export function CompanyDetailsProvider({ children }: { children: React.ReactNode }) {
  const [details, setDetails] = useState<CompanyDetails>(DEFAULT_COMPANY_DETAILS);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state and notify other tabs
  const applyDetails = useCallback((newDetails: CompanyDetails, notify = false) => {
    setDetails(newDetails);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newDetails));
        if (notify && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL);
          channel.postMessage({ type: "UPDATE", data: newDetails });
          channel.close();
        }
      } catch (_) {}
    }
  }, []);

const CANDIDATE_ENDPOINTS = [
  "/api/company-details",
  "/api/company-details.php",
  "/api/index.php?endpoint=company-details",
];

  // Fetch live company details from API (PHP backend on MilesWeb or Next.js route)
  const refreshDetails = useCallback(async () => {
    try {
      for (const endpoint of CANDIDATE_ENDPOINTS) {
        try {
          const sep = endpoint.includes("?") ? "&" : "?";
          const res = await fetch(`${endpoint}${sep}t=${Date.now()}`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.email && data.primaryPhone && data.address) {
              applyDetails(data, false);
              return;
            }
          }
        } catch (_) {
          // Try next fallback endpoint
        }
      }
    } catch (err) {
      console.error("Failed to load company details from API:", err);
    } finally {
      setLoading(false);
    }
  }, [applyDetails]);

  // Initial load: check localStorage for instant hydration, then query S3
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email && parsed.primaryPhone) {
            setDetails(parsed);
          }
        }
      } catch (_) {}
    }

    refreshDetails();
  }, [refreshDetails]);

  // Multi-tab synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "UPDATE" && event.data?.data) {
          setDetails(event.data.data);
        }
      };
    }

    // 2. Storage event listener (fallback)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.email && parsed.primaryPhone) {
            setDetails(parsed);
          }
        } catch (_) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Save new company details to S3 and broadcast (supports PHP backend on MilesWeb)
  const updateCompanyDetails = useCallback(
    async (newDetails: CompanyDetails): Promise<{ success: boolean; error?: string }> => {
      let lastError = "Failed to save company details.";

      for (const endpoint of CANDIDATE_ENDPOINTS) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(newDetails),
          });

          // If endpoint is not found, try next candidate
          if (res.status === 404) {
            continue;
          }

          const json = await res.json().catch(() => null);
          if (res.ok && json?.success) {
            const savedData: CompanyDetails = json.data || newDetails;
            applyDetails(savedData, true);
            return { success: true };
          }

          if (json?.error) {
            lastError = json.error;
          }
        } catch (err: any) {
          lastError = err.message || lastError;
        }
      }

      return { success: false, error: lastError };
    },
    [applyDetails]
  );

  const telPrimary = formatTelLink(details.primaryPhone);
  const telSecondary = details.secondaryPhone ? formatTelLink(details.secondaryPhone) : null;
  const whatsappUrl = formatWhatsAppLink(details.primaryPhone);

  const getWhatsAppUrlWithText = useCallback(
    (customText?: string) => formatWhatsAppLink(details.primaryPhone, customText),
    [details.primaryPhone]
  );

  return (
    <CompanyDetailsContext.Provider
      value={{
        details,
        loading,
        telPrimary,
        telSecondary,
        whatsappUrl,
        getWhatsAppUrlWithText,
        refreshDetails,
        updateCompanyDetails,
      }}
    >
      {children}
    </CompanyDetailsContext.Provider>
  );
}

export function useCompanyDetails() {
  const context = useContext(CompanyDetailsContext);
  if (!context) {
    throw new Error("useCompanyDetails must be used within a CompanyDetailsProvider");
  }
  return context;
}
