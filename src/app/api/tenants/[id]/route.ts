import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Tenant } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET single tenant
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        const { id } = await params;

        const tenant = await Tenant.findByPk(id);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({ tenant });
    } catch (error) {
        console.error('Get tenant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// UPDATE tenant
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('tenants.edit')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const tenant = await Tenant.findByPk(id);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const { name, slug, isActive } = await req.json();
        await tenant.update({ name: name || tenant.name, slug: slug || tenant.slug, isActive: isActive ?? tenant.isActive });

        await logActivity({
            tenantId: auth.user.tenantId,
            userId: auth.user.userId,
            action: 'UPDATE',
            entity: 'tenant',
            entityId: id,
            details: { name, slug, isActive },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ tenant });
    } catch (error) {
        console.error('Update tenant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE tenant (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('tenants.delete')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const tenant = await Tenant.findByPk(id);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        await tenant.destroy(); // paranoid soft delete

        await logActivity({
            tenantId: auth.user.tenantId,
            userId: auth.user.userId,
            action: 'DELETE',
            entity: 'tenant',
            entityId: id,
            details: { name: tenant.name },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        console.error('Delete tenant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
