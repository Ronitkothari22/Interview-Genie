/**
 * Shared fetcher utility for SWR hooks
 * Handles common error cases and response parsing
 */
export async function fetcher<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 401) {
        throw new Error("Unauthorized - Please log in again");
      }
      if (res.status === 403) {
        throw new Error("Forbidden - You do not have access to this resource");
      }
      if (res.status === 404) {
        throw new Error("Resource not found");
      }
      if (res.status >= 500) {
        throw new Error("Server error - Please try again later");
      }

      // Generic error case
      throw new Error("Failed to fetch data");
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch data");
  }
}
