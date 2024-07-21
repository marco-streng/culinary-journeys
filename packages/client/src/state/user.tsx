import { AuthUser } from 'aws-amplify/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  authorized?: AuthUser;

  groups: string[];
  activeGroup?: string;

  setAuthorized: (authorized: AuthUser | undefined) => void;
  setGroups: (groups: string[]) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      groups: [],

      setGroups: (groups) => set(() => ({ groups })),
      setAuthorized: (authorized) =>
        set(() => ({
          authorized,
        })),
    }),
    {
      name: 'user-storage',
    },
  ),
);
