import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Setting } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET settings for tenant
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId');

        // Allow unauthenticated access for default/guest settings
        if (!tenantId) {
            // Return default settings for guests
            return NextResponse.json({
                settings: { theme: 'blue', language: 'id' },
            });
        }

        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();

        if (!auth.user.isSuperAdmin && tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        const settings = await Setting.findAll({ where: { tenantId } });
        const settingsMap: Record<string, string> = {};
        settings.forEach((s: { key: string | number; value: string; }) => {
            settingsMap[s.key] = s.value;
        });

        // Ensure defaults
        if (!settingsMap.theme) settingsMap.theme = 'blue';
        if (!settingsMap.language) settingsMap.language = 'id';

        return NextResponse.json({ settings: settingsMap });
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// UPDATE settings
export async function PUT(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('settings.edit')) {
            return forbiddenResponse();
        }

        const { tenantId, settings } = await req.json();
        const targetTenantId = tenantId || auth.user.tenantId;

        if (!auth.user.isSuperAdmin && targetTenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        // Update each setting
        for (const [key, value] of Object.entries(settings as Record<string, string>)) {
            const existing = await Setting.findOne({
                where: { tenantId: targetTenantId, key },
            });
            if (existing) {
                await existing.update({ value });
            } else {
                await Setting.create({ tenantId: targetTenantId, key, value });
            }
        }

        await logActivity({
            tenantId: targetTenantId,
            userId: auth.user.userId,
            action: 'UPDATE',
            entity: 'settings',
            details: settings,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        // Return updated settings
        const updatedSettings = await Setting.findAll({
            where: { tenantId: targetTenantId },
        });
        const settingsMap: Record<string, string> = {};
        updatedSettings.forEach((s: { key: string | number; value: string; }) => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json({ settings: settingsMap });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
