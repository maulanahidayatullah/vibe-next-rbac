'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/layout/page-transition';
import { toast } from 'sonner';

export default function CreateTenantPage() {
    const t = useTranslations();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', slug: '' });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.slug) {
            toast.error(t('common.error'), { description: 'Name and slug are required' });
            return;
        }
        setSaving(true);
        try {
            await api.createTenant(form);
            toast.success(t('common.success'));
            router.push('/dashboard/tenants');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/dashboard/tenants')}
                        className="hover:bg-accent"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('tenants.createTenant')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Add a new tenant environment</p>
                    </div>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass border-0">
                        <CardHeader>
                            <CardTitle className="text-lg">{t('tenants.details')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-name">{t('tenants.name')}</Label>
                                    <Input
                                        id="tenant-name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Acme Corp"
                                        className="glass border-0 h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-slug">{t('tenants.slug')}</Label>
                                    <Input
                                        id="tenant-slug"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                        placeholder="e.g. acme-corp"
                                        className="glass border-0 h-11"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/dashboard/tenants')}
                                        className="flex-1"
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 theme-gradient text-white border-0 shadow-lg shadow-primary/25"
                                    >
                                        {saving ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            t('common.save')
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageTransition>
    );
}
