import { DataTypes, Model, Sequelize } from 'sequelize';

export class UserRole extends Model {
    declare id: string;
    declare userId: string;
    declare roleId: string;
}

export function initUserRole(sequelize: Sequelize) {
    UserRole.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: 'user_id',
                references: {
                    model: 'users',
                    key: 'id',
                },
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
        },
        {
            sequelize,
            modelName: 'UserRole',
            tableName: 'user_roles',
            underscored: true,
        }
    );
}
