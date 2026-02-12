'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageTransition } from '@/components/layout/page-transition';
import { TableSkeleton } from '@/components/layout/loading-skeletons';
import { toast } from 'sonner';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
}

export default function TenantsPage() {
    const t = useTranslations();
    const { user } = useAuthStore();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTenant, setEditTenant] = useState<Tenant | null>(null);
    const [form, setForm] = useState({ name: '', slug: '' });
    const [saving, setSaving] = useState(false);
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

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTenant) {
                await api.updateTenant(editTenant.id, form);
                toast.success(t('common.success'));
            } else {
                await api.createTenant(form);
                toast.success(t('common.success'));
            }
            setDialogOpen(false);
            setEditTenant(null);
            setForm({ name: '', slug: '' });
            fetchTenants();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

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

    const openEdit = (tenant: Tenant) => {
        setEditTenant(tenant);
        setForm({ name: tenant.name, slug: tenant.slug });
        setDialogOpen(true);
    };

    const openCreate = () => {
        setEditTenant(null);
        setForm({ name: '', slug: '' });
        setDialogOpen(true);
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
                        onClick={openCreate}
                        className="theme-gradient text-white border-0"
                        id="create-tenant-btn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
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
                                                        onClick={() => openEdit(tenant)}
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

                {/* Create/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="glass border-0">
                        <DialogHeader>
                            <DialogTitle>
                                {editTenant ? t('tenants.editTenant') : t('tenants.createTenant')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>{t('tenants.name')}</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="glass border-0"
                                    id="tenant-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('tenants.slug')}</Label>
                                <Input
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="glass border-0"
                                    id="tenant-slug-input"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleSave} disabled={saving} className="theme-gradient text-white border-0">
                                {t('common.save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
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
