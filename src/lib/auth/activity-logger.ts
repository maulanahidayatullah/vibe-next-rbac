import { ActivityLog } from '@/lib/db/models';

export async function logActivity(params: {
    tenantId?: string | null;
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    details?: Record<string, unknown> | null;
    ipAddress?: string | null;
}) {
    try {
        await ActivityLog.create({
            tenantId: params.tenantId || null,
            userId: params.userId || null,
            action: params.action,
            entity: params.entity,
            entityId: params.entityId || null,
            details: params.details || null,
            ipAddress: params.ipAddress || null,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
