'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { cn } from '@/lib/utils';

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
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
        },
        {
            label: t('tenants'),
            href: '/dashboard/tenants',
            permission: 'tenants.view',
            superAdminOnly: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            label: t('users'),
            href: '/dashboard/users',
            permission: 'users.view',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
        },
        {
            label: t('roles'),
            href: '/dashboard/roles',
            permission: 'roles.view',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
        },
        {
            label: t('settings'),
            href: '/dashboard/settings',
            permission: 'settings.view',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
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
                                        Tenant
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
