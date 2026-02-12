'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/navbar';

export default function LoginPage() {
    const t = useTranslations();
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const { applySettings } = useSettingsStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.login(email, password);
            setAuth(data.user, data.accessToken, data.refreshToken);
            if (data.settings) {
                applySettings(data.settings);
            }
            toast.success(t('common.success'), { description: `${t('dashboard.welcome')}, ${data.user.name}!` });
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(t('common.error'), { description: error.message || t('auth.invalidCredentials') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Navbar />

            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 right-20 w-80 h-80 rounded-full theme-gradient opacity-10 blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
                    transition={{ duration: 18, repeat: Infinity }}
                    className="absolute bottom-20 left-20 w-72 h-72 rounded-full theme-gradient opacity-10 blur-3xl"
                />
            </div>

            <main className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="glass overflow-hidden border-0 shadow-2xl">
                        {/* Gradient header line */}
                        <div className="h-1 theme-gradient" />

                        <CardHeader className="text-center pb-2 pt-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                className="w-16 h-16 rounded-2xl theme-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                                    <line x1="12" y1="22" x2="12" y2="15.5" />
                                    <polyline points="22 8.5 12 15.5 2 8.5" />
                                </svg>
                            </motion.div>
                            <h2 className="text-2xl font-bold">{t('auth.loginTitle')}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{t('auth.loginSubtitle')}</p>
                        </CardHeader>

                        <CardContent className="px-8 pb-8">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        required
                                        className="h-11 glass border-0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-11 glass border-0"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 theme-gradient text-white border-0 shadow-lg shadow-primary/25 text-base"
                                    id="submit-login"
                                >
                                    {loading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                                <polyline points="10 17 15 12 10 7" />
                                                <line x1="15" y1="12" x2="3" y2="12" />
                                            </svg>
                                            {t('auth.login')}
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground text-center">
                                    Demo: admin@example.com / admin123
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
