'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Enable UUID extension
        await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // Tenants
        await queryInterface.createTable('tenants', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false, unique: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Users
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            name: { type: Sequelize.STRING, allowNull: false },
            is_super_admin: { type: Sequelize.BOOLEAN, defaultValue: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            refresh_token: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Roles
        await queryInterface.createTable('roles', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            name: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Permissions (global)
        await queryInterface.createTable('permissions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false, unique: true },
            module: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        // Role-Permissions
        await queryInterface.createTable('role_permissions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'roles', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            permission_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'permissions', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        // User-Roles
        await queryInterface.createTable('user_roles', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'roles', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        // Settings
        await queryInterface.createTable('settings', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            key: { type: Sequelize.STRING, allowNull: false },
            value: { type: Sequelize.TEXT, allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Activity Logs
        await queryInterface.createTable('activity_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('uuid_generate_v4()'),
                primaryKey: true,
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'tenants', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
            },
            action: { type: Sequelize.STRING, allowNull: false },
            entity: { type: Sequelize.STRING, allowNull: false },
            entity_id: { type: Sequelize.UUID, allowNull: true },
            details: { type: Sequelize.JSONB, allowNull: true },
            ip_address: { type: Sequelize.STRING, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        // Indexes
        await queryInterface.addIndex('users', ['tenant_id']);
        await queryInterface.addIndex('users', ['email']);
        await queryInterface.addIndex('roles', ['tenant_id']);
        await queryInterface.addIndex('settings', ['tenant_id', 'key']);
        await queryInterface.addIndex('activity_logs', ['tenant_id']);
        await queryInterface.addIndex('activity_logs', ['user_id']);
        await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], { unique: true });
        await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], { unique: true });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('activity_logs');
        await queryInterface.dropTable('settings');
        await queryInterface.dropTable('user_roles');
        await queryInterface.dropTable('role_permissions');
        await queryInterface.dropTable('permissions');
        await queryInterface.dropTable('roles');
        await queryInterface.dropTable('users');
        await queryInterface.dropTable('tenants');
    },
};
