'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const t = useTranslations();
    const router = useRouter();
    const { user, isAuthenticated, logout: storeLogout } = useAuthStore();
    const { mode, toggleMode, toggleSidebar } = useSettingsStore();

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch { }
        storeLogout();
        router.push('/login');
    };

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'G';

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 h-16 glass"
        >
            <div className="flex items-center justify-between h-full px-4 md:px-6">
                {/* Left: Menu Toggle & Logo */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="hover:bg-accent"
                            id="sidebar-toggle"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </Button>
                    )}
                    <motion.div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => router.push('/')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-8 h-8 rounded-lg theme-gradient flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                                <line x1="12" y1="22" x2="12" y2="15.5" />
                                <polyline points="22 8.5 12 15.5 2 8.5" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-bold theme-gradient-text hidden sm:block">
                            {t('common.appName')}
                        </h1>
                    </motion.div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark/Light Toggle */}
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMode}
                            className="relative overflow-hidden hover:bg-accent"
                            id="theme-mode-toggle"
                        >
                            <motion.div
                                key={mode}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {mode === 'dark' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </motion.div>
                        </Button>
                    </motion.div>

                    {/* Login Button or User Menu */}
                    {isAuthenticated && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 hover:bg-accent px-2"
                                    id="user-menu-trigger"
                                >
                                    <Avatar className="h-8 w-8 border-2 border-primary/30">
                                        <AvatarFallback className="text-xs font-semibold theme-gradient text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                                        {user.name}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    {user.isSuperAdmin && (
                                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full theme-gradient text-white">
                                            SUPER ADMIN
                                        </span>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-destructive cursor-pointer"
                                    id="logout-button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    {t('auth.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => router.push('/login')}
                                className="theme-gradient text-white border-0 shadow-lg"
                                id="login-button"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                {t('auth.login')}
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
