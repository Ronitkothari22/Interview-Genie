export function getUrl() {
  // Browser should use relative url
  if (typeof window !== "undefined") return "";

  // SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
