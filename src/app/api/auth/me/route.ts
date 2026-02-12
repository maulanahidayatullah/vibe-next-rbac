import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse } from '@/lib/auth/middleware';
import { User, Role, Permission, Tenant, Setting } from '@/lib/db/models';

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();

        const user = await User.findByPk(auth.user.userId, {
            attributes: { exclude: ['password', 'refreshToken'] },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    include: [{ model: Permission, as: 'permissions' }],
                },
                { model: Tenant, as: 'tenant' },
            ],
        });

        if (!user) return unauthorizedResponse();

        const settings = await Setting.findAll({
            where: { tenantId: user.tenantId },
        });
        const settingsMap: Record<string, string> = {};
        settings.forEach((s: { key: string | number; value: string; }) => {
            settingsMap[s.key] = s.value;
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                tenantId: user.tenantId,
                tenantName: user.tenant?.name,
                isSuperAdmin: user.isSuperAdmin,
                permissions: auth.user.permissions,
                roles: user.roles?.map((r: any) => ({ id: r.id, name: r.name })) || [],
            },
            settings: settingsMap,
        });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
