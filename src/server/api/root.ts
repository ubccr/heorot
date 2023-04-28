import { authRouter } from "./routers/auth";
import { createTRPCRouter } from "~/server/api/trpc";
import { grendelRouter } from "./routers/grendel";
import { switchesRouter } from "./routers/switches";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  grendel: grendelRouter,
  switches: switchesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
