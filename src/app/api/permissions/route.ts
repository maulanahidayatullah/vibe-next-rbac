import { NextRequest, NextResponse } from 'next/server';
import { authenticate, unauthorizedResponse } from '@/lib/auth/middleware';
import { Permission } from '@/lib/db/models';

// GET all permissions (global, used when creating/editing roles)
export async function GET(req: NextRequest) {
    try {
        const auth = await authenticate(req);
        if (!auth) return unauthorizedResponse();

        const permissions = await Permission.findAll({
            order: [['module', 'ASC'], ['name', 'ASC']],
        });

        return NextResponse.json({ permissions });
    } catch (error) {
        console.error('Get permissions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
