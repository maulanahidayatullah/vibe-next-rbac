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
    const router = useRouter();
    const { user, hasPermission } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<RoleData | null>(null);

    const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;

    const fetchData = async () => {
        if (!tenantId) return;
        try {
            const data = await api.getRoles(tenantId);
            setRoles(data.roles || []);
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

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('roles.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage roles and permission assignments</p>
                    </div>
                    {hasPermission('roles.create') && (
                        <Button
                            onClick={() => router.push('/dashboard/roles/create')}
                            className="theme-gradient text-white border-0"
                            id="create-role-btn"
                        >
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/dashboard/roles/${role.id}/edit`)}
                                                        >
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
