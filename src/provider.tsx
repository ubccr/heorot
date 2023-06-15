import { ThemeProvider } from 'next-themes'
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";

export default function Provider({ children, session }: { children: React.ReactNode, session: Session | null }) {
  return (
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </SessionProvider>
  );
}
