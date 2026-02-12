'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTransition } from '@/components/layout/page-transition';
import { TableSkeleton } from '@/components/layout/loading-skeletons';
import { TenantSelector } from '@/components/layout/tenant-selector';
import { toast } from 'sonner';

interface Permission {
    id: string;
    name: string;
    slug: string;
    module: string;
}

interface RoleData {
    id: string;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export default function RolesPage() {
    const t = useTranslations();
    const { user, hasPermission } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editRole, setEditRole] = useState<RoleData | null>(null);
    const [form, setForm] = useState({ name: '', description: '', permissionIds: [] as string[] });
    const [saving, setSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    const fetchData = async () => {
        if (!tenantId) return;
        try {
            const [rolesData, permsData] = await Promise.all([
                api.getRoles(tenantId),
                api.getPermissions(),
            ]);
            setRoles(rolesData.roles || []);
            setPermissions(permsData.permissions || []);
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editRole) {
                await api.updateRole(editRole.id, { ...form, tenantId });
            } else {
                await api.createRole({ ...form, tenantId });
            }
            toast.success(t('common.success'));
            setDialogOpen(false);
            setEditRole(null);
            setForm({ name: '', description: '', permissionIds: [] });
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;
        try {
            await api.deleteRole(roleToDelete.id);
            toast.success(t('common.success'));
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEdit = (role: RoleData) => {
        setEditRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions.map((p) => p.id),
        });
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditRole(null);
        setForm({ name: '', description: '', permissionIds: [] });
        setDialogOpen(true);
    };

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

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('roles.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage roles and permission assignments</p>
                    </div>
                    {hasPermission('roles.create') && (
                        <Button onClick={openCreate} className="theme-gradient text-white border-0" id="create-role-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {t('roles.createRole')}
                        </Button>
                    )}
                </div>

                {user?.isSuperAdmin && <TenantSelector />}

                <Card className="glass border-0">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>{t('roles.name')}</TableHead>
                                        <TableHead>{t('roles.description')}</TableHead>
                                        <TableHead>{t('roles.permissions')}</TableHead>
                                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role, index) => (
                                        <motion.tr
                                            key={role.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                                {role.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap max-w-[300px]">
                                                    {role.permissions.slice(0, 3).map((p) => (
                                                        <Badge key={p.id} variant="secondary" className="text-[10px]">
                                                            {p.slug}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            +{role.permissions.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('roles.edit') && (
                                                        <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                                                            {t('common.edit')}
                                                        </Button>
                                                    )}
                                                    {hasPermission('roles.delete') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setRoleToDelete(role); setDeleteDialogOpen(true); }}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            {t('common.delete')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                    {roles.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                {t('common.noData')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Role Dialog with Permissions */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="glass border-0 max-w-2xl max-h-[85vh]">
                        <DialogHeader>
                            <DialogTitle>{editRole ? t('roles.editRole') : t('roles.createRole')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 overflow-y-auto max-h-[55vh] pr-2">
                            <div className="space-y-2">
                                <Label>{t('roles.name')}</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass border-0" id="role-name-input" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('roles.description')}</Label>
                                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass border-0" id="role-description-input" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">{t('roles.selectPermissions')}</Label>
                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                    <div key={module} className="rounded-xl bg-accent/20 p-4">
                                        <h4 className="text-sm font-semibold capitalize mb-3 theme-gradient-text">{module}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {perms.map((perm) => (
                                                <div key={perm.id} className="flex items-center space-x-2">
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleSave} disabled={saving} className="theme-gradient text-white border-0">{t('common.save')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="glass border-0">
                        <DialogHeader>
                            <DialogTitle>{t('roles.deleteRole')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">{t('roles.confirmDelete')}</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleDelete} variant="destructive">{t('common.delete')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageTransition>
    );
}
