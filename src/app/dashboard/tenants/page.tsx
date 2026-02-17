'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTransition } from '@/components/layout/page-transition';
import { TableSkeleton } from '@/components/layout/loading-skeletons';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
}

export default function TenantsPage() {
    const t = useTranslations();
    const router = useRouter();
    const { user } = useAuthStore();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

    const fetchTenants = async () => {
        try {
            const data = await api.getTenants();
            setTenants(data.tenants || []);
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.isSuperAdmin) fetchTenants();
        else setLoading(false);
    }, [user]);

    const handleDelete = async () => {
        if (!tenantToDelete) return;
        try {
            await api.deleteTenant(tenantToDelete.id);
            toast.success(t('common.success'));
            setDeleteDialogOpen(false);
            setTenantToDelete(null);
            fetchTenants();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (!user?.isSuperAdmin) {
        return (
            <PageTransition>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <p className="text-muted-foreground">{t('common.noData')}</p>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('tenants.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage multi-tenant environments</p>
                    </div>
                    <Button
                        onClick={() => router.push('/dashboard/tenants/create')}
                        className="theme-gradient text-white border-0"
                        id="create-tenant-btn"
                    >
                        <Plus size={16} className="mr-2" />
                        {t('tenants.createTenant')}
                    </Button>
                </div>

                <Card className="glass border-0">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>{t('tenants.name')}</TableHead>
                                        <TableHead>{t('tenants.slug')}</TableHead>
                                        <TableHead>{t('tenants.status')}</TableHead>
                                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map((tenant, index) => (
                                        <motion.tr
                                            key={tenant.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">{tenant.name}</TableCell>
                                            <TableCell>
                                                <code className="px-2 py-1 rounded-md bg-muted text-xs">{tenant.slug}</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={tenant.isActive ? 'default' : 'secondary'} className={tenant.isActive ? 'theme-gradient text-white border-0' : ''}>
                                                    {tenant.isActive ? t('tenants.active') : t('tenants.inactive')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
                                                        className="hover:bg-accent"
                                                    >
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => { setTenantToDelete(tenant); setDeleteDialogOpen(true); }}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                    {tenants.length === 0 && (
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

                {/* Delete Confirmation — keep dialog for destructive action confirmation */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="glass border-0">
                        <DialogHeader>
                            <DialogTitle>{t('tenants.deleteTenant')}</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">{t('tenants.confirmDelete')}</p>
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
