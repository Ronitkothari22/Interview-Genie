import { createApp } from "@/app.js";
import { env } from "@/config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Interview Genie backend listening on http://localhost:${env.PORT}`);
  console.log(`CORS origin: ${env.FRONTEND_URL}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
