'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useSettingsStore } from '@/stores/settings-store';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
import { useEffect, useState } from 'react';

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export function TenantSelector() {
    const t = useTranslations();
    const { user } = useAuthStore();
    const { selectedTenantId, setSelectedTenantId } = useSettingsStore();
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        if (user?.isSuperAdmin) {
            api.getTenants().then((data) => {
                setTenants(data.tenants || []);
                if (!selectedTenantId && data.tenants?.length > 0) {
                    setSelectedTenantId(data.tenants[0].id);
                }
            }).catch(console.error);
        }
    }, [user?.isSuperAdmin]);

    if (!user?.isSuperAdmin) return null;

    return (
        <div className="mb-4">
            <Select
                disabled={!tenants || tenants.length === 0}
                value={selectedTenantId || ''}
                onValueChange={(val) => setSelectedTenantId(val)}
            >
                <SelectTrigger className="glass w-full" id="tenant-selector">
                    <SelectValue placeholder={tenants.length ? t('tenants.selectTenant') : t('common.noData')} />
                </SelectTrigger>
                <SelectContent className="glass">
                    {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
