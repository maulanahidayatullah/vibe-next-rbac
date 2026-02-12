import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    tenantName?: string;
    isSuperAdmin: boolean;
    permissions: string[];
    roles: { id: string; name: string }[];
}

interface AuthState {
    user: UserData | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: UserData, accessToken: string, refreshToken: string) => void;
    setUser: (user: UserData) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            setUser: (user) => set({ user }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            hasPermission: (permission: string) => {
                const { user } = get();
                if (!user) return false;
                if (user.isSuperAdmin) return true;
                return user.permissions.includes(permission);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
