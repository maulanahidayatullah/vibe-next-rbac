import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { User, Role, UserRole } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

// GET single user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        const { id } = await params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!auth.user.isSuperAdmin && user.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// UPDATE user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('users.edit')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!auth.user.isSuperAdmin && user.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        // Superadmin lock: cannot edit superadmin's core flags
        if (user.isSuperAdmin && !auth.user.isSuperAdmin) {
            return forbiddenResponse('Cannot modify superadmin account');
        }

        const { email, password, name, isActive, roleIds } = await req.json();

        const updateData: any = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (isActive !== undefined && !user.isSuperAdmin) updateData.isActive = isActive;
        if (password) updateData.password = await bcrypt.hash(password, 12);

        await user.update(updateData);

        // Update roles (but not for superadmin)
        if (roleIds !== undefined && !user.isSuperAdmin) {
            await UserRole.destroy({ where: { userId: id } });
            if (roleIds.length > 0) {
                await UserRole.bulkCreate(
                    roleIds.map((roleId: string) => ({ userId: id, roleId }))
                );
            }
        }

        await logActivity({
            tenantId: user.tenantId,
            userId: auth.user.userId,
            action: 'UPDATE',
            entity: 'user',
            entityId: id,
            details: { email, name, isActive },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE user (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('users.delete')) {
            return forbiddenResponse();
        }
        const { id } = await params;

        const user = await User.findByPk(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Superadmin lock
        if (user.isSuperAdmin) {
            return NextResponse.json({ error: 'Cannot delete superadmin account' }, { status: 403 });
        }

        if (!auth.user.isSuperAdmin && user.tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        await user.destroy(); // paranoid soft delete

        await logActivity({
            tenantId: user.tenantId,
            userId: auth.user.userId,
            action: 'DELETE',
            entity: 'user',
            entityId: id,
            details: { email: user.email, name: user.name },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
