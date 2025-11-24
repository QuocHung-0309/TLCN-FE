import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAdminToken as saveTokenToLocalStorage, getAdminToken, clearAllTokens } from "@/lib/auth/tokenManager";

type AdminState = {
  adminToken: string | null;
  profile: { id: string; name: string } | null;
  setAuth: (token: string, profile: { id: string; name: string }) => void;
  signOut: () => void;
};

export const useAdminStore = create(
  persist<AdminState>(
    (set) => ({
      adminToken: null,
      profile: null,
      setAuth: (token, profile) => {
        // Sync với tokenManager để adminApi.interceptor có thể lấy token
        saveTokenToLocalStorage(token);
        console.log("✅ Admin token saved:", { token: token.substring(0, 20) + "...", profile });
        set({ adminToken: token, profile });
      },
      signOut: () => {
        clearAllTokens();
        console.log("✅ Admin logged out, all tokens cleared");
        set({ adminToken: null, profile: null });
      },
    }),
    { name: "admin-auth", storage: createJSONStorage(() => localStorage) }
  )
);
