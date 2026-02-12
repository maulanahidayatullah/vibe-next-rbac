'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: cols }).map((_, j) => (
                        <Skeleton key={j} className="h-12 flex-1 rounded-lg" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl glass p-6 space-y-4">
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-8 w-1/2 rounded-lg" />
            <Skeleton className="h-3 w-2/3 rounded-lg" />
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            <div className="rounded-2xl glass p-6">
                <Skeleton className="h-6 w-1/4 rounded-lg mb-4" />
                <TableSkeleton rows={5} cols={4} />
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="rounded-2xl glass p-6 space-y-6">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-1/4 rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
        </div>
    );
}
