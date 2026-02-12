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

interface UserData {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    roles: { id: string; name: string }[];
    tenant?: { id: string; name: string };
}

interface RoleData {
    id: string;
    name: string;
}

export default function UsersPage() {
    const t = useTranslations();
    const { user, hasPermission } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserData | null>(null);
    const [form, setForm] = useState({ email: '', password: '', name: '', roleIds: [] as string[] });
    const [saving, setSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    const fetchData = async () => {
        if (!tenantId) return;
        try {
            const [usersData, rolesData] = await Promise.all([
                api.getUsers(tenantId),
                api.getRoles(tenantId),
            ]);
            setUsers(usersData.users || []);
            setRoles(rolesData.roles || []);
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
            if (editUser) {
                const updateData: any = { name: form.name, roleIds: form.roleIds };
                if (form.email !== editUser.email) updateData.email = form.email;
                if (form.password) updateData.password = form.password;
                await api.updateUser(editUser.id, updateData);
            } else {
                await api.createUser({ ...form, tenantId });
            }
            toast.success(t('common.success'));
            setDialogOpen(false);
            setEditUser(null);
            setForm({ email: '', password: '', name: '', roleIds: [] });
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.deleteUser(userToDelete.id);
            toast.success(t('common.success'));
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const openEdit = (u: UserData) => {
        setEditUser(u);
        setForm({
            email: u.email,
            password: '',
            name: u.name,
            roleIds: u.roles.map((r) => r.id),
        });
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditUser(null);
        setForm({ email: '', password: '', name: '', roleIds: [] });
        setDialogOpen(true);
    };

    const toggleRole = (roleId: string) => {
        setForm((prev) => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter((id) => id !== roleId)
                : [...prev.roleIds, roleId],
        }));
    };

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage users and role assignments</p>
                    </div>
                    {hasPermission('users.create') && (
                        <Button onClick={openCreate} className="theme-gradient text-white border-0" id="create-user-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {t('users.createUser')}
                        </Button>
                    )}
                </div>

                {user?.isSuperAdmin && <TenantSelector />}

                <Card className="glass border-0">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>{t('users.name')}</TableHead>
                                        <TableHead>{t('users.email')}</TableHead>
                                        <TableHead>{t('users.role')}</TableHead>
                                        <TableHead>{t('users.status')}</TableHead>
                                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u, index) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{u.name}</span>
                                                    {u.isSuperAdmin && (
                                                        <Badge variant="outline" className="text-[10px] theme-gradient text-white border-0">SA</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {u.roles.map((r) => (
                                                        <Badge key={r.id} variant="secondary" className="text-xs">
                                                            {r.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={u.isActive ? 'default' : 'secondary'} className={u.isActive ? 'theme-gradient text-white border-0' : ''}>
                                                    {u.isActive ? t('users.active') : t('users.inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('users.edit') && !u.isSuperAdmin && (
                                                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                                                            {t('common.edit')}
                                                        </Button>
                                                    )}
                                                    {hasPermission('users.delete') && !u.isSuperAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setUserToDelete(u); setDeleteDialogOpen(true); }}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            {t('common.delete')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                    {users.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                {t('common.noData')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="glass border-0 max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editUser ? t('users.editUser') : t('users.createUser')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <Label>{t('users.name')}</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass border-0" id="user-name-input" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('users.email')}</Label>
                                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="glass border-0" id="user-email-input" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('users.password')} {editUser && '(leave blank to keep current)'}</Label>
                                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="glass border-0" id="user-password-input" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('users.selectRoles')}</Label>
                                <div className="space-y-2 rounded-xl bg-accent/30 p-3">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={form.roleIds.includes(role.id)}
                                                onCheckedChange={() => toggleRole(role.id)}
                                            />
                                            <label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">{role.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleSave} disabled={saving} className="theme-gradient text-white border-0">{t('common.save')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="glass border-0">
                        <DialogHeader>
                            <DialogTitle>{t('users.deleteUser')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">{t('users.confirmDelete')}</p>
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
