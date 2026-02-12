import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/middleware';
import { ActivityLog, User } from '@/lib/db/models';

// GET activity logs
export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();
        if (!auth.user.isSuperAdmin && !auth.user.permissions.includes('activity_logs.view')) {
            return forbiddenResponse();
        }

        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId') || auth.user.tenantId;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!auth.user.isSuperAdmin && tenantId !== auth.user.tenantId) {
            return forbiddenResponse();
        }

        const where: any = {};
        if (!auth.user.isSuperAdmin) {
            where.tenantId = tenantId;
        } else if (tenantId) {
            where.tenantId = tenantId;
        }

        const { count, rows } = await ActivityLog.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });

        return NextResponse.json({
            logs: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
