// import type { Dispatch, SetStateAction } from "react";
// import { createContext, useContext, useState } from "react";

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";

// interface IUser {
//   username: string;
//   theme: string;
//   role: string;
//   message: string;
// }
// interface IUserContext {
//   user: IUser | null;
//   setUser: Dispatch<SetStateAction<IUser | null>>;
// }

// export const UserContext = createContext<IUserContext>({} as IUserContext);

export default function Provider({ children, session }: { children: React.ReactNode, session: Session | null }) {
  // const [user, setUser] = useState<null | IUser>(null);
  return (
    // <UserContext.Provider value={{ user, setUser }}>
      <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        {children}
      </ThemeProvider>
      </SessionProvider>
    // {/* </UserContext.Provider> */}
  );
}

// export function useUserContext() {
//   return useContext(UserContext);
// }
