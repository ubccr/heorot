import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { prisma } from "~/server/db";
import jwt from "jsonwebtoken";
// type CreateContextOptions = Record<string, never>;

// const createInnerTRPCContext = (opts: CreateContextOptions) => {
//   return {
//     prisma,
//     ...opts
//   };
// };

export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  return {
    req,
    res,
    prisma,
  };
};

import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { env } from "~/env.mjs";
import { Prisma } from "@prisma/client";
import SuperJSON from "superjson";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

interface IErrorHandlerOptions {
  code: string;
  message: string;
}

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  responses: IErrorHandlerOptions[],
  defaultMessage?: string
) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    responses.forEach((response) => {
      if (error.code === response.code) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: response.message,
        });
      }
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  } else
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `A general error occurred. ${
        defaultMessage ?? SuperJSON.stringify(error)
      }`,
    });
};

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  const token = ctx.req.headers.cookie?.split("=")[1];
  if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
  const payload = jwt.verify(token, env.JWT_SECRET);
  return next({
    ctx: {
      payload,
    },
  });
});

export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
// export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
