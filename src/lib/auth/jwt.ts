import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    tenantId: string;
    isSuperAdmin: boolean;
}

export function generateAccessToken(payload: JWTPayload): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign(payload, JWT_SECRET, options);
}

export function generateRefreshToken(payload: JWTPayload): string {
    const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any };
    return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}
