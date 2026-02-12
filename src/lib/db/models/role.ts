import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
    declare id: string;
    declare tenantId: string;
    declare name: string;
    declare description: string | null;
    declare deletedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare permissions?: any[];
}

export function initRole(sequelize: Sequelize) {
    Role.init(
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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Role',
            tableName: 'roles',
            paranoid: true,
            underscored: true,
        }
    );
}
