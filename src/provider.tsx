import type { Dispatch, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";

interface IUser {
  username: string;
  theme: string;
  role: string;
  message: string;
}
interface IUserContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

export const UserContext = createContext<IUserContext>({} as IUserContext);

export default function Provider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<null | IUser>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
