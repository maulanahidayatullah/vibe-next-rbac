'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useSettingsStore } from '@/stores/settings-store';

import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';
import jaMessages from '@/messages/ja.json';

const messagesMap: Record<string, any> = {
    id: idMessages,
    en: enMessages,
    ja: jaMessages,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const language = useSettingsStore((s) => s.language);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <NextIntlClientProvider locale="id" messages={idMessages}>
                {children}
            </NextIntlClientProvider>
        );
    }

    return (
        <NextIntlClientProvider
            locale={language}
            messages={messagesMap[language] || idMessages}
        >
            {children}
        </NextIntlClientProvider>
    );
}
