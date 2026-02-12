'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/layout/page-transition';
import { DashboardSkeleton } from '@/components/layout/loading-skeletons';

export default function DashboardPage() {
    const t = useTranslations();
    const { user } = useAuthStore();
    const { selectedTenantId } = useSettingsStore();
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tenantId = user?.isSuperAdmin ? selectedTenantId : user?.tenantId;
                const [usersData, rolesData, logsData] = await Promise.all([
                    api.getUsers(tenantId || undefined).catch(() => ({ users: [] })),
                    api.getRoles(tenantId || undefined).catch(() => ({ roles: [] })),
                    api.getActivityLogs({ tenantId: tenantId || undefined, limit: 10 }).catch(() => ({ logs: [] })),
                ]);

                setStats({
                    users: usersData.users?.length || 0,
                    roles: rolesData.roles?.length || 0,
                });
                setLogs(logsData.logs || []);
            } catch (error) {
                console.error('Dashboard data error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, selectedTenantId]);

    if (loading) return <DashboardSkeleton />;

    const statCards = [
        {
            title: t('dashboard.totalUsers'),
            value: stats?.users || 0,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: t('dashboard.totalRoles'),
            value: stats?.roles || 0,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: t('dashboard.recentActivity'),
            value: logs.length,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            ),
            color: 'from-orange-500 to-amber-500',
        },
    ];

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {t('dashboard.welcome')}, <span className="theme-gradient-text">{user?.name}</span>
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t('dashboard.title')} •{' '}
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    {user?.isSuperAdmin && (
                        <Badge variant="outline" className="theme-gradient text-white border-0 px-3 py-1 self-start">
                            SUPER ADMIN
                        </Badge>
                    )}
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        >
                            <Card className="glass border-0 overflow-hidden group">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                                            <p className="text-3xl font-bold mt-1">{card.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white opacity-80 group-hover:opacity-100 transition-opacity`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                    <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '70%' }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Activity Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="glass border-0">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                                {t('dashboard.recentActivity')}
                            </h2>
                            {logs.length > 0 ? (
                                <div className="space-y-3">
                                    {logs.map((log: any, index: number) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="w-2 h-2 rounded-full theme-gradient flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">{log.user?.name || 'System'}</span>
                                                    <span className="text-muted-foreground mx-1">•</span>
                                                    <span className="text-muted-foreground">{log.action}</span>
                                                    <span className="text-muted-foreground mx-1">→</span>
                                                    <span>{log.entity}</span>
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">{t('common.noData')}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </PageTransition>
    );
}
