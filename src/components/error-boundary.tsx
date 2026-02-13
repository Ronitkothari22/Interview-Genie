"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    // If we get a hooks error or context error, it's likely due to an invalid session
    if (
      error.message.includes("useContext") ||
      error.message.includes("hook")
    ) {
      // Clear any invalid cookies on the client side
      document.cookie =
        "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "__Secure-next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "__Host-next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Redirect to login
      router.push("/login");
    }
  }, [error, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-4 p-6">
        <h2 className="text-center text-2xl font-bold">
          Something went wrong!
        </h2>
        <p className="text-center text-gray-600">{error.message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/login")}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
