'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { cn } from '@/lib/utils';
import { LayoutGrid, Home, School, Users, Shield, Settings } from 'lucide-react';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    permission?: string;
    superAdminOnly?: boolean;
}

export function Sidebar() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    const router = useRouter();
    const { user, hasPermission } = useAuthStore();
    const { sidebarOpen } = useSettingsStore();

    const menuItems: MenuItem[] = [
        {
            label: t('dashboard'),
            href: '/dashboard',
            permission: 'dashboard.view',
            icon: <LayoutGrid size={20} />,
        },
        {
            label: t('tenants'),
            href: '/dashboard/tenants',
            permission: 'tenants.view',
            superAdminOnly: true,
            icon: <Home size={20} />,
        },
        {
            label: t('schools'),
            href: '/dashboard/schools',
            permission: 'schools.view',
            superAdminOnly: true,
            icon: <School size={20} />,

        },
        {
            label: t('users'),
            href: '/dashboard/users',
            permission: 'users.view',
            icon: <Users size={20} />,
        },
        {
            label: t('roles'),
            href: '/dashboard/roles',
            permission: 'roles.view',
            icon: <Shield size={20} />,
        },
        {
            label: t('settings'),
            href: '/dashboard/settings',
            permission: 'settings.view',
            icon: <Settings size={20} />,
        },
    ];

    const filteredMenuItems = menuItems.filter((item) => {
        if (item.superAdminOnly && !user?.isSuperAdmin) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
    });

    return (
        <AnimatePresence mode="wait">
            {sidebarOpen && (
                <motion.aside
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed left-0 top-16 bottom-0 w-64 z-40 glass overflow-hidden"
                    id="app-sidebar"
                >
                    <div className="flex flex-col h-full pt-4 pb-4">
                        {/* Tenant indicator */}
                        {user?.tenantName && (
                            <div className="px-4 mb-4">
                                <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                        School
                                    </p>
                                    <p className="text-sm font-semibold text-primary truncate">
                                        {user.tenantName}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <nav className="flex-1 px-3 space-y-1">
                            {filteredMenuItems.map((item, index) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <motion.button
                                        key={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => router.push(item.href)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                                            isActive
                                                ? 'theme-gradient text-white shadow-lg shadow-primary/25'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        )}
                                        id={`sidebar-${item.href.split('/').pop()}`}
                                        whileHover={!isActive ? { x: 4 } : {}}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className={cn(
                                            'transition-colors',
                                            isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                                        )}>
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="px-4 mt-auto">
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-3" />
                            <p className="text-[10px] text-muted-foreground text-center">
                                © 2025 LanDev v1.0
                            </p>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
