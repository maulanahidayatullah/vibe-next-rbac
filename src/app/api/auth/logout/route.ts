import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse } from '@/lib/auth/middleware';
import { User } from '@/lib/db/models';
import { logActivity } from '@/lib/auth/activity-logger';

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();

        const user = await User.findByPk(auth.user.userId);
        if (user) {
            await user.update({ refreshToken: null });
        }

        await logActivity({
            tenantId: auth.user.tenantId,
            userId: auth.user.userId,
            action: 'LOGOUT',
            entity: 'auth',
            details: { email: auth.user.email },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        });

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
