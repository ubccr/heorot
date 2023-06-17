/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { Prisma } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import SuperJSON from "superjson";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  } else if (ctx.session.user.role === "disabled") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Account is disabled, please ask an admin to enable it.",
    });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  } else if (ctx.session.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin privileges are required to perform this action.",
    });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);

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
      message: `A general error occurred. ${defaultMessage ?? SuperJSON.stringify(error)}`,
    });
};

// PRE auth.js integration

// import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

// import { prisma } from "~/server/db";
// import jwt from "jsonwebtoken";
// // type CreateContextOptions = Record<string, never>;

// // const createInnerTRPCContext = (opts: CreateContextOptions) => {
// //   return {
// //     prisma,
// //     ...opts
// //   };
// // };

// export const createTRPCContext = (opts: CreateNextContextOptions) => {
//   const { req, res } = opts;
//   return {
//     req,
//     res,
//     prisma,
//   };
// };

// import { TRPCError, initTRPC } from "@trpc/server";
// import superjson from "superjson";
// import { ZodError } from "zod";
// import { env } from "~/env.mjs";
// import { Prisma } from "@prisma/client";
// import SuperJSON from "superjson";

// const t = initTRPC.context<typeof createTRPCContext>().create({
//   transformer: superjson,
//   errorFormatter({ shape, error }) {
//     return {
//       ...shape,
//       data: {
//         ...shape.data,
//         zodError:
//           error.cause instanceof ZodError ? error.cause.flatten() : null,
//       },
//     };
//   },
// });

// interface IErrorHandlerOptions {
//   code: string;
//   message: string;
// }

// export const errorHandler = (
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   error: any,
//   responses: IErrorHandlerOptions[],
//   defaultMessage?: string
// ) => {
//   if (error instanceof Prisma.PrismaClientKnownRequestError) {
//     responses.forEach((response) => {
//       if (error.code === response.code) {
//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: response.message,
//         });
//       }
//     });
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: error.message,
//     });
//   } else
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: `A general error occurred. ${
//         defaultMessage ?? SuperJSON.stringify(error)
//       }`,
//     });
// };

// export const createTRPCRouter = t.router;
// export const publicProcedure = t.procedure;

// const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
//   const token = ctx.req.headers.cookie?.split("=")[1];
//   if (!token) throw new TRPCError({ code: "UNAUTHORIZED" });
//   const payload = jwt.verify(token, env.JWT_SECRET);
//   return next({
//     ctx: {
//       payload,
//     },
//   });
// });

// export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
// // export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
