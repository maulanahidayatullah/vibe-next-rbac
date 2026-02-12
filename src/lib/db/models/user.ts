import { DataTypes, Model, Sequelize } from 'sequelize';

export class User extends Model {
    declare id: string;
    declare tenantId: string;
    declare email: string;
    declare password: string;
    declare name: string;
    declare isSuperAdmin: boolean;
    declare isActive: boolean;
    declare refreshToken: string | null;
    declare deletedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare roles?: any[];
    declare tenant?: any;
}

export function initUser(sequelize: Sequelize) {
    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            tenantId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'tenant_id',
                references: {
                    model: 'tenants',
                    key: 'id',
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isSuperAdmin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_super_admin',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_active',
            },
            refreshToken: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: 'refresh_token',
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            underscored: true,
        }
    );
}
