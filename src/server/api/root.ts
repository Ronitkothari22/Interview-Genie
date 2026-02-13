import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 */
const appRouter = createTRPCRouter({
  // Add your procedures here
});

// Export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const result = await trpc.yourProcedure();
 */
export const createCaller = createCallerFactory(appRouter);

// Single export of the router
export { appRouter };
