'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTransition } from '@/components/layout/page-transition';
import { FormSkeleton } from '@/components/layout/loading-skeletons';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

interface RoleData {
    id: string;
    name: string;
}

export default function EditUserPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { user: authUser } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();

    const [roles, setRoles] = useState<RoleData[]>([]);
    const [form, setForm] = useState({ email: '', password: '', name: '', isActive: true, roleIds: [] as string[] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const tenantId = authUser?.isSuperAdmin ? selectedTenantId : authUser?.tenantId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, rolesData] = await Promise.all([
                    api.getUser(userId),
                    tenantId ? api.getRoles(tenantId) : Promise.resolve({ roles: [] }),
                ]);
                if (userData.user) {
                    setForm({
                        email: userData.user.email,
                        password: '',
                        name: userData.user.name,
                        isActive: userData.user.isActive,
                        roleIds: userData.user.roles?.map((r: any) => r.id) || [],
                    });
                }
                setRoles(rolesData.roles || []);
            } catch (error: any) {
                toast.error(error.message);
                router.push('/dashboard/users');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, tenantId]);

    const toggleRole = (roleId: string) => {
        setForm((prev) => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter((id) => id !== roleId)
                : [...prev.roleIds, roleId],
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updateData: any = { name: form.name, email: form.email, isActive: form.isActive, roleIds: form.roleIds };
            if (form.password) updateData.password = form.password;
            await api.updateUser(userId, updateData);
            toast.success(t('common.success'));
            router.push('/dashboard/users');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
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
                        onClick={() => router.push('/dashboard/users')}
                        className="hover:bg-accent"
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{t('users.editUser')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Update user information</p>
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
                            <CardTitle className="text-lg">{t('users.details')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="user-name">{t('users.name')}</Label>
                                    <Input
                                        id="user-name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="glass border-0 h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-email">{t('users.email')}</Label>
                                    <Input
                                        id="user-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="glass border-0 h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-password">{t('users.password')} <span className="text-xs text-muted-foreground">(kosongkan jika tidak diubah)</span></Label>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="glass border-0 h-11"
                                    />
                                </div>

                                {/* Active toggle */}
                                <div className="flex items-center justify-between rounded-xl bg-accent/20 p-4">
                                    <div>
                                        <Label className="text-sm font-medium">{t('users.status')}</Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">Toggle user active state</p>
                                    </div>
                                    <Switch
                                        checked={form.isActive}
                                        onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                                        id="user-active-toggle"
                                    />
                                </div>

                                {/* Roles */}
                                <div className="space-y-2">
                                    <Label>{t('users.selectRoles')}</Label>
                                    <div className="space-y-2 rounded-xl bg-accent/20 p-4">
                                        {roles.length > 0 ? roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-3 py-1">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={form.roleIds.includes(role.id)}
                                                    onCheckedChange={() => toggleRole(role.id)}
                                                />
                                                <label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer font-medium">{role.name}</label>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/dashboard/users')}
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
