'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // === TENANT ===
        const defaultTenantId = uuidv4();
        await queryInterface.bulkInsert('tenants', [
            {
                id: defaultTenantId,
                name: 'Default Tenant',
                slug: 'default',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // === PERMISSIONS ===
        const permissionsData = [
            // Dashboard
            { name: 'View Dashboard', slug: 'dashboard.view', module: 'dashboard', description: 'View dashboard' },
            // Tenants
            { name: 'View Tenants', slug: 'tenants.view', module: 'tenants', description: 'View tenants list' },
            { name: 'Create Tenant', slug: 'tenants.create', module: 'tenants', description: 'Create new tenant' },
            { name: 'Edit Tenant', slug: 'tenants.edit', module: 'tenants', description: 'Edit tenant' },
            { name: 'Delete Tenant', slug: 'tenants.delete', module: 'tenants', description: 'Delete tenant' },
            // Users
            { name: 'View Users', slug: 'users.view', module: 'users', description: 'View users list' },
            { name: 'Create User', slug: 'users.create', module: 'users', description: 'Create new user' },
            { name: 'Edit User', slug: 'users.edit', module: 'users', description: 'Edit user' },
            { name: 'Delete User', slug: 'users.delete', module: 'users', description: 'Delete user' },
            // Roles
            { name: 'View Roles', slug: 'roles.view', module: 'roles', description: 'View roles list' },
            { name: 'Create Role', slug: 'roles.create', module: 'roles', description: 'Create new role' },
            { name: 'Edit Role', slug: 'roles.edit', module: 'roles', description: 'Edit role' },
            { name: 'Delete Role', slug: 'roles.delete', module: 'roles', description: 'Delete role' },
            // Settings
            { name: 'View Settings', slug: 'settings.view', module: 'settings', description: 'View settings' },
            { name: 'Edit Settings', slug: 'settings.edit', module: 'settings', description: 'Edit settings' },
            // Activity Logs
            { name: 'View Activity Logs', slug: 'activity_logs.view', module: 'activity_logs', description: 'View activity logs' },
        ];

        const permissions = permissionsData.map((p) => ({
            ...p,
            id: uuidv4(),
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await queryInterface.bulkInsert('permissions', permissions);

        // === ROLES ===
        const superAdminRoleId = uuidv4();
        const adminRoleId = uuidv4();
        const userRoleId = uuidv4();

        await queryInterface.bulkInsert('roles', [
            {
                id: superAdminRoleId,
                tenant_id: defaultTenantId,
                name: 'Super Admin',
                description: 'Full access to all resources across all tenants',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: adminRoleId,
                tenant_id: defaultTenantId,
                name: 'Admin',
                description: 'Full access within tenant scope',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: userRoleId,
                tenant_id: defaultTenantId,
                name: 'User',
                description: 'Basic access within tenant scope',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // === ROLE PERMISSIONS ===
        // SuperAdmin gets ALL permissions
        const superAdminRolePermissions = permissions.map((p) => ({
            id: uuidv4(),
            role_id: superAdminRoleId,
            permission_id: p.id,
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await queryInterface.bulkInsert('role_permissions', superAdminRolePermissions);

        // Admin gets everything except tenant management
        const adminPermissions = permissions.filter(
            (p) => !p.slug.startsWith('tenants.')
        );
        const adminRolePermissions = adminPermissions.map((p) => ({
            id: uuidv4(),
            role_id: adminRoleId,
            permission_id: p.id,
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await queryInterface.bulkInsert('role_permissions', adminRolePermissions);

        // User gets only view permissions for dashboard and settings
        const userPermissions = permissions.filter((p) =>
            ['dashboard.view', 'settings.view'].includes(p.slug)
        );
        const userRolePermissions = userPermissions.map((p) => ({
            id: uuidv4(),
            role_id: userRoleId,
            permission_id: p.id,
            created_at: new Date(),
            updated_at: new Date(),
        }));
        await queryInterface.bulkInsert('role_permissions', userRolePermissions);

        // === SUPER ADMIN USER ===
        const superAdminUserId = uuidv4();
        const hashedPassword = await bcrypt.hash('admin123', 12);

        await queryInterface.bulkInsert('users', [
            {
                id: superAdminUserId,
                tenant_id: defaultTenantId,
                email: 'admin@example.com',
                password: hashedPassword,
                name: 'Super Admin',
                is_super_admin: true,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Assign Super Admin role
        await queryInterface.bulkInsert('user_roles', [
            {
                id: uuidv4(),
                user_id: superAdminUserId,
                role_id: superAdminRoleId,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // === DEFAULT SETTINGS ===
        await queryInterface.bulkInsert('settings', [
            {
                id: uuidv4(),
                tenant_id: defaultTenantId,
                key: 'theme',
                value: 'blue',
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                tenant_id: defaultTenantId,
                key: 'language',
                value: 'id',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('settings', null, {});
        await queryInterface.bulkDelete('user_roles', null, {});
        await queryInterface.bulkDelete('users', null, {});
        await queryInterface.bulkDelete('role_permissions', null, {});
        await queryInterface.bulkDelete('roles', null, {});
        await queryInterface.bulkDelete('permissions', null, {});
        await queryInterface.bulkDelete('tenants', null, {});
    },
};
