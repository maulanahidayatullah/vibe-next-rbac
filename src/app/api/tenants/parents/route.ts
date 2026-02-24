import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Tenant } from '@/lib/db/models';

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('tenants.view')) {
            return forbiddenResponse();
        }

        const tenants = await Tenant.findAll({
            where: { isDeleted: false, type: 'fdt' },
            order: [['createdAt', 'DESC']],
        });
        return NextResponse.json({ tenants });
    } catch (error) {
        console.error('Get tenants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}