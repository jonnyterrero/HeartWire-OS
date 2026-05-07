import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-medium text-blue-500">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          That route doesn&apos;t exist (yet).
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
