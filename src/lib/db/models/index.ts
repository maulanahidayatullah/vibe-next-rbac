import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'next_fullstack',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    }
);

// Models
import { initTenant, Tenant } from './tenant';
import { initUser, User } from './user';
import { initRole, Role } from './role';
import { initPermission, Permission } from './permission';
import { initRolePermission, RolePermission } from './role-permission';
import { initUserRole, UserRole } from './user-role';
import { initSetting, Setting } from './setting';
import { initActivityLog, ActivityLog } from './activity-log';

// Initialize models
initTenant(sequelize);
initUser(sequelize);
initRole(sequelize);
initPermission(sequelize);
initRolePermission(sequelize);
initUserRole(sequelize);
initSetting(sequelize);
initActivityLog(sequelize);

// Associations
// Tenant associations
Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'users' });
Tenant.hasMany(Role, { foreignKey: 'tenantId', as: 'roles' });
Tenant.hasMany(Setting, { foreignKey: 'tenantId', as: 'settings' });
Tenant.hasMany(ActivityLog, { foreignKey: 'tenantId', as: 'activityLogs' });

// User associations
User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'roles' });
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });

// Role associations
Role.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId', as: 'users' });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });

// Permission associations
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });

// Setting associations
Setting.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

// ActivityLog associations
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ActivityLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

export {
    sequelize,
    Tenant,
    User,
    Role,
    Permission,
    RolePermission,
    UserRole,
    Setting,
    ActivityLog,
};
