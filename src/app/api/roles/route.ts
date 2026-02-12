import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Role, Permission, RolePermission } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET roles for tenant
export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('roles.view')) {
            return forbiddenResponse();
        }

        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId') || auth.user.tenantId;

        if (!auth.user.isSuperAdmin && tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        const roles = await Role.findAll({
            where: { tenantId },
            include: [{ model: Permission, as: 'permissions' }],
            order: [['createdAt', 'DESC']],
        });

        return NextResponse.json({ roles });
    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// CREATE role
export async function POST(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('roles.create')) {
            return forbiddenResponse();
        }

        const { name, description, tenantId, permissionIds } = await req.json();
        const targetTenantId = tenantId || auth.user.tenantId;

        if (!auth.user.isSuperAdmin && targetTenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const role = await Role.create({
            name,
            description: description || null,
            tenantId: targetTenantId,
        });

        if (permissionIds && permissionIds.length > 0) {
            await RolePermission.bulkCreate(
                permissionIds.map((pid: string) => ({
                    roleId: role.id,
                    permissionId: pid,
                }))
            );
        }

        await logActivity({
            tenantId: targetTenantId,
            userId: auth.user.userId,
            action: 'CREATE',
            entity: 'role',
            entityId: role.id,
            details: { name, permissionIds },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        const createdRole = await Role.findByPk(role.id, {
            include: [{ model: Permission, as: 'permissions' }],
        });

        return NextResponse.json({ role: createdRole }, { status: 201 });
    } catch (error) {
        console.error('Create role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
