'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTransition } from '@/components/layout/page-transition';
import { TenantSelector } from '@/components/layout/selector/tenant/tenant';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

interface Permission {
    id: string;
    name: string;
    slug: string;
    module: string;
}

export default function CreateRolePage() {
    const t = useTranslations();
    const router = useRouter();
    const { user } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [form, setForm] = useState({ name: '', description: '', permissionIds: [] as string[] });
    const [saving, setSaving] = useState(false);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    useEffect(() => {
        api.getPermissions().then((data) => setPermissions(data.permissions || [])).catch(console.error);
    }, []);

    const togglePermission = (permId: string) => {
        setForm((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permId)
                ? prev.permissionIds.filter((id) => id !== permId)
                : [...prev.permissionIds, permId],
        }));
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) {
            toast.error(t('common.error'), { description: 'Name is required' });
            return;
        }
        setSaving(true);
        try {
            await api.createRole({ ...form, tenantId });
            toast.success(t('common.success'));
            router.push('/dashboard/roles');
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
                        onClick={() => router.push('/dashboard/roles')}
                        className="hover:bg-accent"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('roles.createRole')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Create a new role with permissions</p>
                    </div>
                </div>

                {user?.isSuperAdmin && <TenantSelector />}

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass border-0">
                        <CardHeader>
                            <CardTitle className="text-lg">{t('roles.details')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="role-name">{t('roles.name')}</Label>
                                    <Input
                                        id="role-name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Manager"
                                        className="glass border-0 h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role-description">{t('roles.description')}</Label>
                                    <Input
                                        id="role-description"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Role description..."
                                        className="glass border-0 h-11"
                                    />
                                </div>

                                {/* Permissions grouped by module */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">{t('roles.selectPermissions')}</Label>
                                    {Object.entries(groupedPermissions).map(([module, perms]) => (
                                        <div key={module} className="rounded-xl bg-accent/20 p-4">
                                            <h4 className="text-sm font-semibold capitalize mb-3 theme-gradient-text">{module}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {perms.map((perm) => (
                                                    <div key={perm.id} className="flex items-center space-x-3 py-1">
                                                        <Checkbox
                                                            id={`perm-${perm.id}`}
                                                            checked={form.permissionIds.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                        />
                                                        <label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer">
                                                            {perm.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/dashboard/roles')}
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
