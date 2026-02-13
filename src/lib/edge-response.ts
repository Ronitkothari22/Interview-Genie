export function edgeResponse(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function edgeError(message: string, status: number = 400) {
  return edgeResponse({ error: message }, { status });
}

export function edgeSuccess(data: any, status: number = 200) {
  return edgeResponse(data, { status });
}
