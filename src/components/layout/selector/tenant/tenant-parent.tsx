'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
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
    setSelectedTenantId: (tenantId: string | null) => void;
}

interface TenantParentSelectorProps {
    value?: string;
    onChange: (value: string) => void;
}

export function TenantParentSelector({ value, onChange }: TenantParentSelectorProps) {
    const t = useTranslations();
    const { user } = useAuthStore();
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        if (!user?.isSuperAdmin) return;

        api.getTenantsParents()
            .then((data) => {
                const list = [
                    { id: "0", name: "--- No Parent ---", slug: "" },
                    ...(data.tenants ?? []),
                ];
                setTenants(list);

                if (!value) {
                    onChange("0");
                }
            })
            .catch(console.error);
    }, [user?.isSuperAdmin]);

    if (!user?.isSuperAdmin) return null;

    return (
        <div className="mb-4">
            <Select
                value={value} // pastikan value ada
                onValueChange={(val) => onChange(val)}
                disabled={tenants.length === 0}
            >
                <SelectTrigger className="w-full" id="tenant-selector">
                    <SelectValue placeholder={tenants.length ? t('tenants.selectTenant') : t('common.noData')} />
                </SelectTrigger>
                <SelectContent>
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