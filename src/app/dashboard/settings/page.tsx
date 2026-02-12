'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore, ThemeColor, Language } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/layout/page-transition';
import { TenantSelector } from '@/components/layout/tenant-selector';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const themeColors: { value: ThemeColor; label: string; colorClass: string; preview: string }[] = [
    { value: 'blue', label: 'blue', colorClass: 'bg-blue-500', preview: 'from-blue-500 to-indigo-500' },
    { value: 'red', label: 'red', colorClass: 'bg-red-500', preview: 'from-red-500 to-rose-500' },
    { value: 'yellow', label: 'yellow', colorClass: 'bg-yellow-500', preview: 'from-yellow-500 to-amber-500' },
    { value: 'green', label: 'green', colorClass: 'bg-green-500', preview: 'from-green-500 to-emerald-500' },
];

const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'id', label: 'indonesian', flag: '🇮🇩' },
    { value: 'en', label: 'english', flag: '🇺🇸' },
    { value: 'ja', label: 'japanese', flag: '🇯🇵' },
];

export default function SettingsPage() {
    const t = useTranslations();
    const { user, hasPermission } = useAuthStore();
    const settingsStore = useSettingsStore();
    const { selectedTenantId, setTheme, setLanguage, theme, language } = settingsStore;
    const [localTheme, setLocalTheme] = useState<ThemeColor>(theme);
    const [localLanguage, setLocalLanguage] = useState<Language>(language);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    useEffect(() => {
        const loadSettings = async () => {
            if (!tenantId) return;
            try {
                const data = await api.getSettings(tenantId);
                if (data.settings) {
                    if (data.settings.theme) setLocalTheme(data.settings.theme as ThemeColor);
                    if (data.settings.language) setLocalLanguage(data.settings.language as Language);
                }
            } catch (error) {
                console.error('Load settings error:', error);
            }
            setLoaded(true);
        };
        loadSettings();
    }, [tenantId]);

    const handleSave = async () => {
        if (!tenantId) return;
        setSaving(true);
        try {
            await api.updateSettings({
                tenantId,
                settings: {
                    theme: localTheme,
                    language: localLanguage,
                },
            });
            // Apply globally
            setTheme(localTheme);
            setLanguage(localLanguage);
            toast.success(t('settings.saved'));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const canEdit = hasPermission('settings.edit');

    return (
        <PageTransition>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Configure tenant appearance and localization</p>
                </div>

                {user?.isSuperAdmin && <TenantSelector />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Theme Color */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass border-0 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="6" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                    {t('settings.theme')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {themeColors.map((color) => (
                                        <motion.button
                                            key={color.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => canEdit && setLocalTheme(color.value)}
                                            disabled={!canEdit}
                                            className={cn(
                                                'relative p-4 rounded-xl border-2 transition-all duration-200',
                                                localTheme === color.value
                                                    ? 'border-primary shadow-lg shadow-primary/20'
                                                    : 'border-transparent hover:border-border',
                                                !canEdit && 'opacity-60 cursor-not-allowed'
                                            )}
                                            id={`theme-${color.value}`}
                                        >
                                            <div className={`h-12 rounded-lg bg-gradient-to-r ${color.preview} mb-2`} />
                                            <span className="text-sm font-medium capitalize">
                                                {t(`settings.${color.label}`)}
                                            </span>
                                            {localTheme === color.value && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2 w-5 h-5 rounded-full theme-gradient flex items-center justify-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Language */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="glass border-0 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    {t('settings.language')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {languages.map((lang) => (
                                        <motion.button
                                            key={lang.value}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => canEdit && setLocalLanguage(lang.value)}
                                            disabled={!canEdit}
                                            className={cn(
                                                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                                                localLanguage === lang.value
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-transparent hover:border-border',
                                                !canEdit && 'opacity-60 cursor-not-allowed'
                                            )}
                                            id={`lang-${lang.value}`}
                                        >
                                            <span className="text-3xl">{lang.flag}</span>
                                            <div>
                                                <p className="font-medium">{t(`settings.${lang.label}`)}</p>
                                                <p className="text-xs text-muted-foreground uppercase">{lang.value}</p>
                                            </div>
                                            {localLanguage === lang.value && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-auto w-5 h-5 rounded-full theme-gradient flex items-center justify-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Save Button */}
                {canEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-end"
                    >
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="theme-gradient text-white border-0 px-8 h-11 shadow-lg shadow-primary/25"
                            id="save-settings-btn"
                        >
                            {saving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                                />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                            )}
                            {t('common.save')}
                        </Button>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
}
