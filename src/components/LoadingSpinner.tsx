"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  text,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-stone-200 border-t-orange-500 rounded-full animate-spin shadow-xs`}
        style={{ animationDuration: "0.6s" }}
      />
      {text && (
        <p className="text-stone-500 text-xs font-medium mt-3 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
