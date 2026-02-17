import { DataTypes, Model, Sequelize } from 'sequelize';

export class Setting extends Model {
    declare id: string;
    declare tenantId: string;
    declare key: string;
    declare value: string;
    declare isDeleted: boolean;
    declare deletedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export function initSetting(sequelize: Sequelize) {
    Setting.init(
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
            key: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_deleted',
            },
        },
        {
            sequelize,
            modelName: 'Setting',
            tableName: 'settings',
            paranoid: true,
            underscored: true,
        }
    );
}
