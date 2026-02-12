'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSettingsStore((s) => s.theme);
    const mode = useSettingsStore((s) => s.mode);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme, mode, mounted]);

    if (!mounted) {
        return <div className="dark" data-theme="blue">{children}</div>;
    }

    return <>{children}</>;
}
