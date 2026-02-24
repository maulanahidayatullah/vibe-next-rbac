'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageTransition } from '@/components/layout/page-transition';
import { FormSkeleton } from '@/components/layout/loading-skeletons';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { DateField } from '@/components/ui/day-picker';

export default function EditTenantPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const tenantId = params.id as string;

    const [form, setForm] = useState({ name: '', slug: '', isActive: true, periodStart: '', periodEnd: '', type: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const data = await api.getTenant(tenantId);
                if (data.tenant) {
                    setForm({
                        name: data.tenant.name,
                        slug: data.tenant.slug,
                        isActive: data.tenant.isActive,
                        periodStart: data.tenant.periodStart,
                        periodEnd: data.tenant.periodEnd,
                        type: data.tenant.type,
                    });
                }
            } catch (error: any) {
                toast.error(error.message);
                router.push('/dashboard/tenants');
            } finally {
                setLoading(false);
            }
        };
        fetchTenant();
    }, [tenantId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log(form);

        if (!form.name || !form.slug || !form.periodStart || !form.periodEnd) {
            toast.error(t('common.error'), { description: 'Name, slug, period start, and period end are required' });
            return;
        }
        setSaving(true);
        try {
            await api.updateTenant(tenantId, form);
            toast.success(t('common.success'));
            router.push('/dashboard/tenants');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };


    const slugify = (value: string) => {
        return value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <FormSkeleton />
            </div>
        );
    }

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
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('tenants.editTenant')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Update tenant information</p>
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
                                        onChange={(e) => {
                                            const name = e.target.value;

                                            setForm({
                                                ...form,
                                                name,
                                                slug: slugify(name),
                                            });
                                        }}
                                        className="glass border-0 h-11"
                                        required={false}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-slug">{t('tenants.slug')}</Label>
                                    <Input
                                        id="tenant-slug"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                        className="glass border-0 h-11"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tenant-period-start">{t('tenants.periodStart')}</Label>
                                    <DateField
                                        required={true}
                                        value={form.periodStart}
                                        onChange={(value) =>
                                            setForm({ ...form, periodStart: value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tenant-period-end">{t('tenants.periodEnd')}</Label>
                                    <DateField
                                        required={true}
                                        value={form.periodEnd}
                                        onChange={(value) =>
                                            setForm({ ...form, periodEnd: value })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-accent/20 p-4">
                                    <div>
                                        <Label className="text-sm font-medium">{t('tenants.foundation')}</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Toggle {t('tenants.foundation')} state</p>
                                    </div>
                                    <Switch
                                        checked={form.type}
                                        onCheckedChange={(checked) => setForm({ ...form, type: checked })}
                                        id="tenant-parent-toggle"
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-accent/20 p-4">
                                    <div>
                                        <Label className="text-sm font-medium">{t('tenants.status')}</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Toggle tenant active state</p>
                                    </div>
                                    <Switch
                                        checked={form.isActive}
                                        onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                                        id="tenant-active-toggle"
                                    />
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
