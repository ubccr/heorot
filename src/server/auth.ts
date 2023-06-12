import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compareSync } from "bcryptjs";
import { getServerSession } from "next-auth";
import { type GetServerSidePropsContext } from "next";
import { type DefaultSession } from "next-auth";
import { type NextAuthOptions } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

import CredentialsProvider from "next-auth/providers/credentials";
// import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string;
    role: string;
    theme: string;
  }
}
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      role: string;
      theme: string;
    } & DefaultSession["user"];
  }

  interface User {
   username: string;
   role: string;
    theme: string;
  }
}

export const authOptions: NextAuthOptions = {
callbacks: {
  jwt({token, user}){
   if (!user) return token 
   token.username = user.username
   token.role = user.role
   token.theme = user.theme
   return token
  },
   session({session, token}){
    if (!token) return session
    session.user.username = token.username
    session.user.role = token.role
    session.user.theme = token.theme
    return session
  }
},
  session: {
    strategy: "jwt",
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            username: { label: "Username", type: "text", placeholder: "jsmith" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {          
            if (credentials === undefined) return null
           const user = await prisma.user.findUnique({
            where: { username: credentials.username }})

           if (user && compareSync(credentials.password, user.password)) return user
           return null
          }
    })
  ],
  pages: {
    signIn: "/auth/login",
  }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
