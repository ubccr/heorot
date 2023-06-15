import {
  createTRPCRouter,
  privateProcedure,
} from "~/server/api/trpc";

import { z } from "zod";

export const redfishRouter = createTRPCRouter({
  get: privateProcedure.input(z.string()).query(async ({ input }) => {})
});
