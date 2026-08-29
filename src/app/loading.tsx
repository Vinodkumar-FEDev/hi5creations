import LoadingSpinner from "@/src/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center max-w-sm w-full">
        <LoadingSpinner size="lg" text="Loading Hi5 Creation..." />
      </div>
    </div>
  );
}
