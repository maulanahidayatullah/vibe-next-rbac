'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTransition } from '@/components/layout/page-transition';
import { TableSkeleton } from '@/components/layout/loading-skeletons';
import { TenantSelector } from '@/components/layout/tenant-selector';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    isSuperAdmin: boolean;
    roles: { id: string; name: string }[];
    tenant?: { id: string; name: string };
}

export default function UsersPage() {
    const t = useTranslations();
    const router = useRouter();
    const { user, hasPermission } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    const fetchData = async () => {
        if (!tenantId) return;
        try {
            const data = await api.getUsers(tenantId);
            setUsers(data.users || []);
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [tenantId]);

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

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage users and role assignments</p>
                    </div>
                    {hasPermission('users.create') && (
                        <Button
                            onClick={() => router.push('/dashboard/users/create')}
                            className="theme-gradient text-white border-0"
                            id="create-user-btn"
                        >
                            <Plus size={16} className="mr-2" />
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/dashboard/users/${u.id}/edit`)}
                                                        >
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

                {/* Delete Confirmation */}
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
