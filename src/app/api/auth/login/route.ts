import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User, Role, Permission, Setting, Tenant } from '@/lib/db/models';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { logActivity } from '@/lib/auth/activity-logger';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({
            where: { email, isActive: true },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    include: [{ model: Permission, as: 'permissions' }],
                },
                { model: Tenant, as: 'tenant' },
            ],
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Gather permissions
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

        if (user.isSuperAdmin) {
            const allPerms = await Permission.findAll();
            for (const p of allPerms) {
                if (!permissions.includes(p.slug)) {
                    permissions.push(p.slug);
                }
            }
        }

        const payload = {
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            isSuperAdmin: user.isSuperAdmin,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        await user.update({ refreshToken });

        // Get tenant settings
        const settings = await Setting.findAll({
            where: { tenantId: user.tenantId },
        });

        const settingsMap: Record<string, string> = {};
        settings.forEach((s: { key: string | number; value: string; }) => {
            settingsMap[s.key] = s.value;
        });

        await logActivity({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'LOGIN',
            entity: 'auth',
            details: { email: user.email },
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                tenantId: user.tenantId,
                tenantName: user.tenant?.name,
                isSuperAdmin: user.isSuperAdmin,
                permissions,
                roles: user.roles?.map((r: any) => ({ id: r.id, name: r.name })) || [],
            },
            settings: settingsMap,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
