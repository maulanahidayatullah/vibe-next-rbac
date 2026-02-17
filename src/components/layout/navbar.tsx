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
import { Menu, Hexagon, Sun, Moon, LogOut, LogIn } from 'lucide-react';

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
                            <Menu size={20} />
                        </Button>
                    )}
                    <motion.div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => router.push('/')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-8 h-8 rounded-lg theme-gradient flex items-center justify-center">
                            <Hexagon size={18} stroke="white" strokeWidth={2.5} />
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
                                    <Sun size={18} />
                                ) : (
                                    <Moon size={18} />
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
                                    <LogOut size={16} className="mr-2" />
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
                                <LogIn size={16} className="mr-2" />
                                {t('auth.login')}
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
