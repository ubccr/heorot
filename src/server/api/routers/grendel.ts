import type { IGrendelHost, IGrendelImage } from "~/types/grendel";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { grendel_host_schema, grendel_image_schema } from "~/types/grendel";

import { TRPCError } from "@trpc/server";
import got from "got";
import { grendel_host_find } from "~/server/functions/grendel";
import { z } from "zod";

export const GRENDEL_SOCKET_PATH = process.env.GRENDEL_SOCKET_PATH ?? "";
if (GRENDEL_SOCKET_PATH === "")
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Grendel socket path is not defined.",
  });

export const grendelRouter = createTRPCRouter({
  host: createTRPCRouter({
    host: privateProcedure
      .input(grendel_host_schema)
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res: any = await got
            .post(`${GRENDEL_SOCKET_PATH}:/v1/host`, {
              json: input,
            })
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
    list: privateProcedure.query(async () => {
      try {
        const res: IGrendelHost = await got(
          `${GRENDEL_SOCKET_PATH}:/v1/host/list`
        ).json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
    find: privateProcedure.input(z.string()).query(async ({ input }) => {
      return grendel_host_find(input);
    }),
    tags: privateProcedure.input(z.string()).query(async ({ input }) => {
      try {
        const res: IGrendelHost = await got(
          `${GRENDEL_SOCKET_PATH}:/v1/host/tags/${input}`
        ).json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
    delete: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      try {
        // TODO: add response type definitions
        const res = await got
          .delete(`${GRENDEL_SOCKET_PATH}:/v1/host/find/${input}`)
          .json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
    provision: privateProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res = await got
            .put(`${GRENDEL_SOCKET_PATH}:/v1/host/provision/${input}`)
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
    unprovision: privateProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res = await got
            .put(`${GRENDEL_SOCKET_PATH}:/v1/host/unprovision/${input}`)
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
    tag: privateProcedure
      .input(
        z.object({
          name: z.string(),
          tags: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res = await got
            .put(
              `${GRENDEL_SOCKET_PATH}:/v1/host/tag/${input.name}?tags=${input.tags}`
            )
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
    untag: privateProcedure
      .input(
        z.object({
          name: z.string(),
          tags: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res = await got
            .put(
              `${GRENDEL_SOCKET_PATH}:/v1/host/untag/${input.name}?tags=${input.tags}`
            )
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
  }),
  image: createTRPCRouter({
    image: privateProcedure
      .input(grendel_image_schema)
      .mutation(async ({ input }) => {
        try {
          // TODO: add response type definitions
          const res = await got
            .post(`${GRENDEL_SOCKET_PATH}:/v1/bootimage`, {
              json: input,
            })
            .json();

          return [...res];
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to receive grendel request.",
            cause: error,
          });
        }
      }),
    list: privateProcedure.mutation(async () => {
      try {
        const res: IGrendelImage[] = await got(
          `${GRENDEL_SOCKET_PATH}:/v1/bootimage/list`
        ).json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
    find: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      try {
        const res: IGrendelImage[] = await got(
          `${GRENDEL_SOCKET_PATH}:/v1/bootimage/find/${input}`
        ).json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
    delete: privateProcedure.input(z.string()).mutation(async ({ input }) => {
      try {
        // TODO: add response type definitions
        const res = await got
          .delete(`${GRENDEL_SOCKET_PATH}:/v1/bootimage/find/${input}`)
          .json();

        return [...res];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to receive grendel request.",
          cause: error,
        });
      }
    }),
  }),
});
