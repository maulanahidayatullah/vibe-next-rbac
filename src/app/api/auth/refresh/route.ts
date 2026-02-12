import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const { refreshToken } = await req.json();
        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
        }

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        const user = await User.findOne({
            where: { id: payload.userId, refreshToken, isActive: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        const newPayload = {
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
            isSuperAdmin: user.isSuperAdmin,
        };

        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = generateRefreshToken(newPayload);

        await user.update({ refreshToken: newRefreshToken });

        return NextResponse.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Refresh error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
