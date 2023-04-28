import { compareSync, hashSync } from "bcryptjs";
import {
  createTRPCRouter,
  errorHandler,
  publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import jwt from "jsonwebtoken";
import { prisma } from "~/server/db";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const role = (await prisma.user.count()) > 0 ? "disabled" : "admin";

        await prisma.user.create({
          data: {
            username: input.username,
            password: hashSync(input.password),
            role,
          },
        });
        return {
          message: "User created successfully",
        };
      } catch (error) {
        const responses = [
          { code: "P2002", message: "Username already exists" },
        ];
        errorHandler(error, responses, "api/routes/auth.ts");
      }
    }),
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { username: input.username },
      });
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      if (compareSync(input.password, user.password)) {
        user.password = "";
        const accessToken = jwt.sign(
          { username: user.username, role: user.role },
          env.JWT_SECRET ?? "",
          { expiresIn: "8h" }
        );
        ctx.res.setHeader(
          "Set-Cookie",
          `token=${accessToken}; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict; Secure;`
        );
        return {
          message: `Welcome ${user.username}, successfully logged in`,
          ...user,
        };
      } else
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid password",
        });
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", "token=; Path=/; Max-Age=0");
    return {
      message: "Successfully logged out",
    };
  }),
});
