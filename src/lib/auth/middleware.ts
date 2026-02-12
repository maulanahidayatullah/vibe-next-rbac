import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from '@/lib/auth/jwt';
import { User, Role, Permission, RolePermission, UserRole } from '@/lib/db/models';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload & { permissions: string[] };
}

export async function authenticate(req: NextRequest): Promise<{
    user: JWTPayload & { permissions: string[] };
} | null> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload) return null;

    // Fetch user permissions
    const user = await User.findByPk(payload.userId, {
        include: [
            {
                model: Role,
                as: 'roles',
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                    },
                ],
            },
        ],
    });

    if (!user || !user.isActive) return null;

    const permissions: string[] = [];
    if (user.roles) {
        for (const role of user.roles) {
            if (role.permissions) {
                for (const perm of role.permissions) {
                    if (!permissions.includes(perm.slug)) {
                        permissions.push(perm.slug);
                    }
                }
            }
        }
    }

    // Superadmin gets all permissions implicitly
    if (payload.isSuperAdmin) {
        const allPerms = await Permission.findAll();
        for (const p of allPerms) {
            if (!permissions.includes(p.slug)) {
                permissions.push(p.slug);
            }
        }
    }

    return {
        user: { ...payload, permissions },
    };
}

export function requirePermission(permissions: string[]) {
    return (userPermissions: string[], isSuperAdmin: boolean): boolean => {
        if (isSuperAdmin) return true;
        return permissions.some((p) => userPermissions.includes(p));
    };
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json({ error: message }, { status: 403 });
}
