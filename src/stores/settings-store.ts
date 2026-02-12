import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'blue' | 'red' | 'yellow' | 'green';
export type ThemeMode = 'light' | 'dark';
export type Language = 'id' | 'en' | 'ja';

interface SettingsState {
    theme: ThemeColor;
    mode: ThemeMode;
    language: Language;
    selectedTenantId: string | null;
    sidebarOpen: boolean;

    setTheme: (theme: ThemeColor) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    setLanguage: (language: Language) => void;
    setSelectedTenantId: (tenantId: string | null) => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    applySettings: (settings: Record<string, string>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            theme: 'blue',
            mode: 'dark',
            language: 'id',
            selectedTenantId: null,
            sidebarOpen: true,

            setTheme: (theme) => set({ theme }),
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
            setLanguage: (language) => set({ language }),
            setSelectedTenantId: (selectedTenantId) => set({ selectedTenantId }),
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

            applySettings: (settings) => {
                const updates: Partial<SettingsState> = {};
                if (settings.theme && ['blue', 'red', 'yellow', 'green'].includes(settings.theme)) {
                    updates.theme = settings.theme as ThemeColor;
                }
                if (settings.language && ['id', 'en', 'ja'].includes(settings.language)) {
                    updates.language = settings.language as Language;
                }
                set(updates);
            },
        }),
        {
            name: 'settings-storage',
            partialize: (state) => ({
                theme: state.theme,
                mode: state.mode,
                language: state.language,
                selectedTenantId: state.selectedTenantId,
                sidebarOpen: state.sidebarOpen,
            }),
        }
    )
);
