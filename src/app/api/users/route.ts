import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { User, Role, Tenant } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';
import { UserRole } from '@/lib/db/models';

// GET users for tenant
export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('users.view')) {
            return forbiddenResponse();
        }

        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId') || auth.user.tenantId;

        // Non-superadmin can only see their own tenant
        if (!auth.user.isSuperAdmin && tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        const users = await User.findAll({
            where: { tenantId },
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [
                { model: Role, as: 'roles', attributes: ['id', 'name'] },
                { model: Tenant, as: 'tenant', attributes: ['id', 'name'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// CREATE user
export async function POST(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('users.create')) {
            return forbiddenResponse();
        }

        const { email, password, name, tenantId, roleIds } = await req.json();
        const targetTenantId = tenantId || auth.user.tenantId;

        if (!auth.user.isSuperAdmin && targetTenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            tenantId: targetTenantId,
        });

        // Assign roles
        if (roleIds && roleIds.length > 0) {
            const roleAssignments = roleIds.map((roleId: string) => ({
                userId: user.id,
                roleId,
            }));
            await UserRole.bulkCreate(roleAssignments);
        }

        await logActivity({
            tenantId: targetTenantId,
            userId: auth.user.userId,
            action: 'CREATE',
            entity: 'user',
            entityId: user.id,
            details: { email, name },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        const createdUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
        });

        return NextResponse.json({ user: createdUser }, { status: 201 });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
