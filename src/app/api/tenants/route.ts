import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Tenant, Setting } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET all tenants (superadmin only)
export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('tenants.view')) {
            return forbiddenResponse();
        }

        const tenants = await Tenant.findAll({ order: [['createdAt', 'DESC']] });
        return NextResponse.json({ tenants });
    } catch (error) {
        console.error('Get tenants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// CREATE tenant (superadmin only)
export async function POST(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('tenants.create')) {
            return forbiddenResponse();
        }

        const { name, slug } = await req.json();
        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const existing = await Tenant.findOne({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'Tenant with this slug already exists' }, { status: 409 });
        }

        const tenant = await Tenant.create({ name, slug });

        // Create default settings for new tenant
        await Setting.bulkCreate([
            { tenantId: tenant.id, key: 'theme', value: 'blue' },
            { tenantId: tenant.id, key: 'language', value: 'id' },
        ]);

        await logActivity({
            tenantId: auth.user.tenantId,
            userId: auth.user.userId,
            action: 'CREATE',
            entity: 'tenant',
            entityId: tenant.id,
            details: { name, slug },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ tenant }, { status: 201 });
    } catch (error) {
        console.error('Create tenant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
