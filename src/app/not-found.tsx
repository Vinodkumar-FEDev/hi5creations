import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-lg">
        <h2 className="text-3xl font-extrabold text-stone-900 mb-2 font-display">
          Page Not Found
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-full transition-colors shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
