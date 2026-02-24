import { DataTypes, Model, Sequelize } from 'sequelize';

export class Tenant extends Model {
    declare id: string;
    declare name: string;
    declare slug: string;
    declare isActive: boolean;
    declare isDeleted: boolean;
    declare deletedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare periodStart: Date | null;
    declare periodEnd: Date | null;
    declare type: boolean;
}

export function initTenant(sequelize: Sequelize) {
    Tenant.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                field: 'is_active',
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_deleted',
            },
            periodStart: {
                type: DataTypes.DATE,
                field: 'period_start',
            },
            periodEnd: {
                type: DataTypes.DATE,
                field: 'period_end',
            },
            type: {
                type: DataTypes.STRING,
                field: 'type',
            },
            parentId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Tenant',
            tableName: 'tenants',
            paranoid: true,
            underscored: true,
        }
    );
}
