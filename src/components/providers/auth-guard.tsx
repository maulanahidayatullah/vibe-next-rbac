'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, accessToken, setAuth, logout, setLoading } = useAuthStore();
    const { applySettings } = useSettingsStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (pathname === '/login') {
                setLoading(false);
                setChecked(true);
                return;
            }

            if (!accessToken) {
                setLoading(false);
                setChecked(true);
                router.push('/login');
                return;
            }

            try {
                const data = await api.getMe();
                setAuth(data.user, accessToken, useAuthStore.getState().refreshToken || '');
                if (data.settings) {
                    applySettings(data.settings);
                }
            } catch {
                logout();
                router.push('/login');
            }

            setLoading(false);
            setChecked(true);
        };

        checkAuth();
    }, [pathname]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
