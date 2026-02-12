import { DataTypes, Model, Sequelize } from 'sequelize';

export class ActivityLog extends Model {
    declare id: string;
    declare tenantId: string | null;
    declare userId: string | null;
    declare action: string;
    declare entity: string;
    declare entityId: string | null;
    declare details: object | null;
    declare ipAddress: string | null;
    declare createdAt: Date;
}

export function initActivityLog(sequelize: Sequelize) {
    ActivityLog.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            tenantId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'tenant_id',
                references: {
                    model: 'tenants',
                    key: 'id',
                },
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'user_id',
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            entity: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            entityId: {
                type: DataTypes.UUID,
                allowNull: true,
                field: 'entity_id',
            },
            details: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            ipAddress: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'ip_address',
            },
        },
        {
            sequelize,
            modelName: 'ActivityLog',
            tableName: 'activity_logs',
            underscored: true,
            updatedAt: false,
        }
    );
}
