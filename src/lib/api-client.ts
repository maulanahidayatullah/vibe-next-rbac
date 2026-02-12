const API_BASE = '/api';

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem('auth-storage');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.state?.accessToken || null;
            }
        } catch {
            return null;
        }
        return null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Try refresh
            const refreshed = await this.tryRefresh();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this.getToken()}`;
                const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
                    ...options,
                    headers,
                });
                if (!retryResponse.ok) {
                    const error = await retryResponse.json().catch(() => ({}));
                    throw new Error(error.error || 'Request failed');
                }
                return retryResponse.json();
            }
            // Force logout
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
            throw new Error('Session expired');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    private async tryRefresh(): Promise<boolean> {
        try {
            const stored = localStorage.getItem('auth-storage');
            if (!stored) return false;
            const parsed = JSON.parse(stored);
            const refreshToken = parsed?.state?.refreshToken;
            if (!refreshToken) return false;

            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) return false;

            const data = await response.json();
            parsed.state.accessToken = data.accessToken;
            parsed.state.refreshToken = data.refreshToken;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
            return true;
        } catch {
            return false;
        }
    }

    // Auth
    login(email: string, password: string) {
        return this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    logout() {
        return this.request<any>('/auth/logout', { method: 'POST' });
    }

    getMe() {
        return this.request<any>('/auth/me');
    }

    // Tenants
    getTenants() {
        return this.request<any>('/tenants');
    }

    getTenant(id: string) {
        return this.request<any>(`/tenants/${id}`);
    }

    createTenant(data: { name: string; slug: string }) {
        return this.request<any>('/tenants', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateTenant(id: string, data: any) {
        return this.request<any>(`/tenants/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteTenant(id: string) {
        return this.request<any>(`/tenants/${id}`, { method: 'DELETE' });
    }

    // Users
    getUsers(tenantId?: string) {
        const params = tenantId ? `?tenantId=${tenantId}` : '';
        return this.request<any>(`/users${params}`);
    }

    getUser(id: string) {
        return this.request<any>(`/users/${id}`);
    }

    createUser(data: any) {
        return this.request<any>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateUser(id: string, data: any) {
        return this.request<any>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteUser(id: string) {
        return this.request<any>(`/users/${id}`, { method: 'DELETE' });
    }

    // Roles
    getRoles(tenantId?: string) {
        const params = tenantId ? `?tenantId=${tenantId}` : '';
        return this.request<any>(`/roles${params}`);
    }

    getRole(id: string) {
        return this.request<any>(`/roles/${id}`);
    }

    createRole(data: any) {
        return this.request<any>('/roles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    updateRole(id: string, data: any) {
        return this.request<any>(`/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    deleteRole(id: string) {
        return this.request<any>(`/roles/${id}`, { method: 'DELETE' });
    }

    // Permissions
    getPermissions() {
        return this.request<any>('/permissions');
    }

    // Settings
    getSettings(tenantId?: string) {
        const params = tenantId ? `?tenantId=${tenantId}` : '';
        return this.request<any>(`/settings${params}`);
    }

    updateSettings(data: { tenantId?: string; settings: Record<string, string> }) {
        return this.request<any>('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Activity Logs
    getActivityLogs(params?: { tenantId?: string; page?: number; limit?: number }) {
        const searchParams = new URLSearchParams();
        if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return this.request<any>(`/activity-logs${query ? `?${query}` : ''}`);
    }
}

export const api = new ApiClient();
