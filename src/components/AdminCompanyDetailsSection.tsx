"use client";

import React, { useState, useEffect } from "react";
import { useCompanyDetails } from "@/src/context/CompanyDetailsContext";
import {
  DEFAULT_COMPANY_DETAILS,
  CompanyDetails,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
  getGoogleMapsDirectionsUrl,
  cleanLocationInput,
} from "@/src/data/companyDetails";

export default function AdminCompanyDetailsSection() {
  const { details, updateCompanyDetails } = useCompanyDetails();

  const [isEditing, setIsEditing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompanyDetails>({
    email: details.email,
    primaryPhone: details.primaryPhone,
    secondaryPhone: details.secondaryPhone || "",
    address: details.address,
    serviceArea: details.serviceArea || "Coimbatore & across South India",
    mapPinQuery: details.mapPinQuery || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync form state when details update and not actively editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        email: details.email,
        primaryPhone: details.primaryPhone,
        secondaryPhone: details.secondaryPhone || "",
        address: details.address,
        serviceArea: details.serviceArea || "Coimbatore & across South India",
        mapPinQuery: details.mapPinQuery || "",
      });
    }
  }, [details, isEditing]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStartEdit = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormData({
      email: details.email,
      primaryPhone: details.primaryPhone,
      secondaryPhone: details.secondaryPhone || "",
      address: details.address,
      serviceArea: details.serviceArea || "Coimbatore & across South India",
      mapPinQuery: details.mapPinQuery || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormData({
      email: details.email,
      primaryPhone: details.primaryPhone,
      secondaryPhone: details.secondaryPhone || "",
      address: details.address,
      serviceArea: details.serviceArea || "Coimbatore & across South India",
      mapPinQuery: details.mapPinQuery || "",
    });
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset fields to default factory values? Click 'Save Changes' afterwards to commit to S3.")) {
      setFormData({
        email: DEFAULT_COMPANY_DETAILS.email,
        primaryPhone: DEFAULT_COMPANY_DETAILS.primaryPhone,
        secondaryPhone: DEFAULT_COMPANY_DETAILS.secondaryPhone || "",
        address: DEFAULT_COMPANY_DETAILS.address,
        serviceArea: DEFAULT_COMPANY_DETAILS.serviceArea || "Coimbatore & across South India",
        mapPinQuery: DEFAULT_COMPANY_DETAILS.mapPinQuery || "",
      });
      setErrorMsg(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = formData.email.trim();
    const cleanPrimaryPhone = formData.primaryPhone.trim();
    const cleanSecondaryPhone = (formData.secondaryPhone || "").trim();
    const cleanAddress = formData.address.trim();
    const cleanServiceArea = (formData.serviceArea || "").trim();
    const cleanMapPinQuery = cleanLocationInput(formData.mapPinQuery || "");

    if (!cleanEmail) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!cleanPrimaryPhone) {
      setErrorMsg("Primary mobile number is required.");
      return;
    }

    if (!cleanAddress) {
      setErrorMsg("Company address is required.");
      return;
    }

    setIsSaving(true);

    try {
      const payload: CompanyDetails = {
        email: cleanEmail,
        primaryPhone: cleanPrimaryPhone,
        secondaryPhone: cleanSecondaryPhone || undefined,
        address: cleanAddress,
        serviceArea: cleanServiceArea || "Coimbatore & across South India",
        mapPinQuery: cleanMapPinQuery || undefined,
        latitude: typeof formData.latitude === "number" ? formData.latitude : undefined,
        longitude: typeof formData.longitude === "number" ? formData.longitude : undefined,
      };

      const result = await updateCompanyDetails(payload);

      if (result.success) {
        setSuccessMsg("Changes saved to AWS S3 and synchronized across the website.");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(result.error || "Failed to commit changes to S3.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const mapsUrl = getGoogleMapsSearchUrl(details);
  const directionsUrl = getGoogleMapsDirectionsUrl(details);

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden transition-all">
      {/* Top Header - Always Open & Perfectly Aligned on Mobile */}
      <div className="p-4 sm:p-6 pb-4 sm:pb-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-stone-50/40">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 13v.01M9 17v.01" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight leading-snug">
                Company Contact &amp; Business Address
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                S3 Live Sync
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 sm:mt-0.5 leading-relaxed">
              Official physical workshop location and inquiry contacts stored in AWS S3
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleStartEdit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer select-none"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              <span>Edit Address &amp; Contact</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container - Permanent Visibility (Does NOT Collapse) */}
      <div className="p-4 sm:p-6">
        {/* Status Feedback Alerts */}
        {successMsg && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-emerald-50/95 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="leading-snug">{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold shrink-0 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-rose-50/95 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="leading-snug">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold shrink-0 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {!isEditing ? (
          /* ================= RESPONSIVE VIEW MODE ================= */
          <div className="space-y-4">
            {/* Top Row: Direct Contact Channels (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {/* 1. Official Email */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-2xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.email, "email")}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                      title="Copy to clipboard"
                    >
                      {copiedKey === "email" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block mb-1">
                    Official Email
                  </span>
                  <a
                    href={`mailto:${details.email}`}
                    className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors break-all leading-snug block"
                  >
                    {details.email}
                  </a>
                </div>
                <span className="text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-200/60 block">
                  Header &amp; footer inquiries
                </span>
              </div>

              {/* 2. Primary Mobile No. */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-2xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.primaryPhone, "phone1")}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                      title="Copy to clipboard"
                    >
                      {copiedKey === "phone1" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">
                      Primary Phone
                    </span>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/70">
                      Main Hotline
                    </span>
                  </div>

                  <a
                    href={`tel:${details.primaryPhone.replace(/[^0-9+]/g, "")}`}
                    className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors leading-snug block"
                  >
                    {details.primaryPhone}
                  </a>
                </div>
                <span className="text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-200/60 block">
                  Navbar direct dial &amp; WhatsApp inquiries
                </span>
              </div>

              {/* 3. Secondary Mobile No. */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-2xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                        <path d="M12 18h.01" />
                      </svg>
                    </div>
                    {details.secondaryPhone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(details.secondaryPhone || "", "phone2")}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                        title="Copy to clipboard"
                      >
                        {copiedKey === "phone2" ? "✓ Copied" : "Copy"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase">
                      Secondary Phone
                    </span>
                    <span className="text-[9px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                      Optional
                    </span>
                  </div>

                  {details.secondaryPhone ? (
                    <a
                      href={`tel:${details.secondaryPhone.replace(/[^0-9+]/g, "")}`}
                      className="text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors leading-snug block"
                    >
                      {details.secondaryPhone}
                    </a>
                  ) : (
                    <span className="text-xs text-stone-400 italic block">
                      Not configured
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-200/60 block">
                  Secondary line on website footer
                </span>
              </div>
            </div>

            {/* Bottom Row: Service Area & Physical Address */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {/* 4. Service Area */}
              <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 flex items-center justify-center text-stone-700 shadow-2xs">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(details.serviceArea || "Coimbatore & across South India", "area")}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                      title="Copy to clipboard"
                    >
                      {copiedKey === "area" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block mb-1">
                    Service Area &amp; Coverage
                  </span>
                  <p className="text-sm font-bold text-stone-900 leading-snug">
                    {details.serviceArea || "Coimbatore & across South India"}
                  </p>
                </div>
                <span className="text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-200/60 block">
                  Installation and delivery coverage
                </span>
              </div>

              {/* 5. Workshop & Office Physical Address (Spans 2 columns on Desktop, Full Width on Mobile) */}
              <div className="lg:col-span-2 bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center shadow-2xs shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block leading-none">
                          Company Physical Location
                        </span>
                        <span className="text-xs font-extrabold text-stone-900 mt-0.5 block">
                          Workshop &amp; Registered Office
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-bold text-orange-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <span>Open in Maps</span>
                        <span>↗</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(details.address, "addr")}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200/70 text-[11px] font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                        title="Copy to clipboard"
                      >
                        {copiedKey === "addr" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <address className="not-italic text-sm text-stone-800 leading-relaxed font-medium whitespace-pre-line bg-white/80 border border-stone-200/70 rounded-xl p-3.5 shadow-2xs">
                    {details.address}
                  </address>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-400 mt-4 pt-3 border-t border-stone-200/60 gap-2">
                  <span>Signage fabrication workshop, customer visits &amp; dispatches</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Active Location
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Live Google Map Marker Pin Preview */}
            <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 transition-all hover:bg-white hover:border-orange-300 hover:shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-stone-400 tracking-wider uppercase block leading-none">
                        Google Maps Location Pin
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Live Marker
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-stone-900 mt-0.5 block">
                      Marked place based on your address
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-bold text-orange-700 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                    <span>Edit Location</span>
                  </button>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-bold text-orange-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Get Directions</span>
                    <span className="text-xs">→</span>
                  </a>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Fullscreen</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Responsive Map Container */}
              <div className="relative rounded-xl overflow-hidden border border-stone-200/90 aspect-[16/9] sm:aspect-[21/9] min-h-[200px] max-h-[360px] bg-stone-100 shadow-inner">
                <iframe
                  title="Admin Location Marker Map"
                  src={getGoogleMapsEmbedUrl(details)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 mt-3 pt-2.5 border-t border-stone-200/60 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">
                    Pin placed at: <span className="font-semibold text-stone-800">{details.mapPinQuery?.trim() || details.address}</span>
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">
                  Reflected in real time on public website Contact section
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= RESPONSIVE EDIT FORM ================= */
          <form onSubmit={handleSave} className="space-y-5">
            <div className="bg-stone-50/60 border border-stone-200/90 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-stone-200/80">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight">
                    Edit Company Details &amp; Location
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Changes persist directly to AWS S3 Cloud (<code className="font-mono text-[11px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">users/admin/company-details.json</code>)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="self-start sm:self-auto text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  ↺ Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* 1. Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Official Email <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hi5creationbe@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-stone-900 font-medium transition-all outline-hidden shadow-2xs"
                  />
                  <p className="text-[11px] text-stone-400">
                    Customer correspondence and website mailto links
                  </p>
                </div>

                {/* 2. Primary Mobile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Primary Mobile <span className="text-orange-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Main Hotline
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.primaryPhone}
                    onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                    placeholder="+91 63792 39878"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-stone-900 font-medium transition-all outline-hidden shadow-2xs"
                  />
                  <p className="text-[11px] text-stone-400">
                    Navbar click-to-call and WhatsApp inquiry line
                  </p>
                </div>

                {/* 3. Secondary Mobile */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Secondary Mobile
                    </label>
                    <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.secondaryPhone || ""}
                    onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                    placeholder="+91 78453 63330 (leave blank if none)"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-stone-900 font-medium transition-all outline-hidden shadow-2xs"
                  />
                  <p className="text-[11px] text-stone-400">
                    Alternative telephone line on website footer
                  </p>
                </div>

                {/* 4. Service Area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Service Area &amp; Coverage
                  </label>
                  <input
                    type="text"
                    value={formData.serviceArea || ""}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="Coimbatore & across South India"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-stone-900 font-medium transition-all outline-hidden shadow-2xs"
                  />
                  <p className="text-[11px] text-stone-400">
                    Operational regions and signage installation coverage
                  </p>
                </div>

                {/* 5. Workshop & Office Address (Text Input) */}
                <div className="md:col-span-2 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Workshop &amp; Office Address <span className="text-orange-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Display address for contact &amp; website footer
                    </span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="No. 2/89, Palakkad - Coimbatore Rd, Gandhi Nagar, Kuniyamuthur, Tamil Nadu 641008."
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm text-stone-900 font-medium transition-all outline-hidden shadow-2xs resize-y leading-relaxed"
                  />
                  <p className="text-[11px] text-stone-400">
                    Full physical postal address for customer visits, inquiries, and billing.
                  </p>
                </div>

                {/* 6. Map Location (Selected Manually) */}
                <div className="md:col-span-2 space-y-3 pt-3 border-t border-stone-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>Map Location (Selected Manually)</span>
                        </label>
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          Google Maps Pin
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Type coordinates, landmark, or paste Google Maps URL that you selected manually for the map marker pin.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.address.trim()) {
                            setFormData((prev) => ({ ...prev, mapPinQuery: prev.address.trim() }));
                          }
                        }}
                        className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                        title="Use the workshop address above as map pin location"
                      >
                        Use Workshop Address
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.mapPinQuery?.trim() || formData.address || "Coimbatore")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs"
                        title="Open Google Maps in a new tab to find or copy location"
                      >
                        <span>Open Google Maps</span>
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Text Input for Manually Selected Map Location */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.mapPinQuery || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const cleaned = cleanLocationInput(val);
                          const coordMatch = cleaned.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
                          if (coordMatch) {
                            setFormData({
                              ...formData,
                              mapPinQuery: val,
                              latitude: parseFloat(coordMatch[1]),
                              longitude: parseFloat(coordMatch[2]),
                            });
                          } else {
                            setFormData({ ...formData, mapPinQuery: val });
                          }
                        }}
                        placeholder="e.g. 10.9664, 76.9422 or Kuniyamuthur Coimbatore or paste Google Maps link"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-sm font-medium text-stone-900 transition-all outline-hidden shadow-2xs"
                      />
                      {formData.mapPinQuery && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mapPinQuery: "" })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer p-1"
                          title="Clear pin location"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-400">
                      <span>Enter coordinates, landmark, or paste a Google Maps link manually selected from Google Maps.</span>
                      <span>If blank, your Workshop Address is automatically used.</span>
                    </div>
                  </div>

                  {/* Live Google Maps Preview in Edit Mode */}
                  <div className="mt-3 rounded-2xl border border-stone-200/90 overflow-hidden bg-stone-100 shadow-inner">
                    <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="font-semibold text-stone-700 truncate">
                          Live Google Map Preview:
                        </span>
                        <span className="font-mono text-orange-600 truncate text-[11px]">
                          {cleanLocationInput(formData.mapPinQuery) || formData.address || "Coimbatore"}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">Updates live as you type</span>
                    </div>

                    <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[190px] max-h-[300px] w-full">
                      <iframe
                        title="Live Google Maps Edit Preview"
                        src={getGoogleMapsEmbedUrl({
                          address: formData.address,
                          mapPinQuery: formData.mapPinQuery,
                          latitude: formData.latitude,
                          longitude: formData.longitude,
                        })}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Action Buttons - Fully Responsive on Mobile */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-all cursor-pointer disabled:opacity-50 text-center shadow-2xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 text-center"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to AWS S3...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    <span>Save Changes to Cloud</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </section>
  );
}
