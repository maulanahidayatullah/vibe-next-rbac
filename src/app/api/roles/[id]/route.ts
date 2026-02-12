import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { Role, Permission, RolePermission } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET single role
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        const { id } = await params;

        const role = await Role.findByPk(id, {
            include: [{ model: Permission, as: 'permissions' }],
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        if (!auth.user.isSuperAdmin && role.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        return NextResponse.json({ role });
    } catch (error) {
        console.error('Get role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// UPDATE role
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('roles.edit')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const role = await Role.findByPk(id);
        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        if (!auth.user.isSuperAdmin && role.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        const { name, description, permissionIds } = await req.json();
        await role.update({
            name: name || role.name,
            description: description !== undefined ? description : role.description,
        });

        if (permissionIds !== undefined) {
            await RolePermission.destroy({ where: { roleId: id } });
            if (permissionIds.length > 0) {
                await RolePermission.bulkCreate(
                    permissionIds.map((pid: string) => ({
                        roleId: id,
                        permissionId: pid,
                    }))
                );
            }
        }

        await logActivity({
            tenantId: role.tenantId,
            userId: auth.user.userId,
            action: 'UPDATE',
            entity: 'role',
            entityId: id,
            details: { name, permissionIds },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        const updatedRole = await Role.findByPk(id, {
            include: [{ model: Permission, as: 'permissions' }],
        });

        return NextResponse.json({ role: updatedRole });
    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE role (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('roles.delete')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const role = await Role.findByPk(id);
        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        if (!auth.user.isSuperAdmin && role.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        await role.destroy();

        await logActivity({
            tenantId: role.tenantId,
            userId: auth.user.userId,
            action: 'DELETE',
            entity: 'role',
            entityId: id,
            details: { name: role.name },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Delete role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
