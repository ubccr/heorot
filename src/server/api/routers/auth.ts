import {
  adminProcedure,
  createTRPCRouter,
  errorHandler,
  publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { hashSync } from "bcryptjs";
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
    users: createTRPCRouter({
      list: adminProcedure.query(async () => {
        const users = await prisma.user.findMany({
          select: { username: true, role: true, theme: true, createdAt: true, updatedAt: true },
        });
        return users;
      }),
      edit: createTRPCRouter({
        role: adminProcedure
        .input(z.object({ role: z.string(), users: z.string().array()}))
        .mutation(async ({ input }) => {
          try {
            const user_res = await prisma.user.updateMany({
              where: {username: {in: input.users}},
              data: {role: input.role}
            })
            
            return `Successfully changed ${user_res.count} user(s) to ${input.role}`
          } catch (error) {
            console.error(error)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "An error occurred while updating the user's role",
              cause: error
            })
            
          }
        }),
      })
    })
  // login: publicProcedure
  //   .input(z.object({ username: z.string(), password: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const user = await prisma.user.findUnique({
  //       where: { username: input.username },
  //     });
  //     if (!user)
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "User not found",
  //       });
  //     if (compareSync(input.password, user.password)) {
  //       user.password = "";
  //       const accessToken = jwt.sign(
  //         { username: user.username, role: user.role },
  //         env.JWT_SECRET ?? "",
  //         { expiresIn: "8h" }
  //       );
  //       ctx.res.setHeader(
  //         "Set-Cookie",
  //         `token=${accessToken}; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict; Secure;`
  //       );
  //       return {
  //         message: `Welcome ${user.username}, successfully logged in`,
  //         ...user,
  //       };
  //     } else
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Invalid password",
  //       });
  //   }),
  // logout: publicProcedure.mutation(({ ctx }) => {
  //   ctx.res.setHeader("Set-Cookie", "token=; Path=/; Max-Age=0");
  //   return {
  //     message: "Successfully logged out",
  //   };
  // }),
});
