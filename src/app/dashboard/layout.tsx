'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { AuthGuard } from '@/components/providers/auth-guard';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebarOpen = useSettingsStore((s) => s.sidebarOpen);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background">
                <Navbar />
                <Sidebar />
                <main
                    className={cn(
                        'pt-20 pb-6 px-4 md:px-6 transition-all duration-300 ease-in-out min-h-screen',
                        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
                    )}
                >
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
