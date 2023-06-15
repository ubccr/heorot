import { authRouter } from "./routers/auth";
import { createTRPCRouter } from "~/server/api/trpc";
import { frontendRouter } from "./routers/frontend";
import { grendelRouter } from "./routers/grendel";
import { redfishRouter } from "./routers/redfish";
import { switchesRouter } from "./routers/switches";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  frontend: frontendRouter,
  grendel: grendelRouter,
  redfish: redfishRouter,
  switches: switchesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
