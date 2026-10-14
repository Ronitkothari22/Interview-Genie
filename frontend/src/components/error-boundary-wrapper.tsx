"use client";

import { useEffect } from "react";

export function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // If we get a hooks error or context error, it's likely due to an invalid session
      if (
        event.error?.message?.includes("useContext") ||
        event.error?.message?.includes("hook")
      ) {
        // Best-effort cookie clear on the client side
        document.cookie =
          "ig_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

        // Redirect to login
        window.location.href = "/login";
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return <>{children}</>;
}
