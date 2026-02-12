import { DataTypes, Model, Sequelize } from 'sequelize';

export class RolePermission extends Model {
    declare id: string;
    declare roleId: string;
    declare permissionId: string;
}

export function initRolePermission(sequelize: Sequelize) {
    RolePermission.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            roleId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'role_id',
                references: {
                    model: 'roles',
                    key: 'id',
                },
            },
            permissionId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'permission_id',
                references: {
                    model: 'permissions',
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            modelName: 'RolePermission',
            tableName: 'role_permissions',
            underscored: true,
        }
    );
}
