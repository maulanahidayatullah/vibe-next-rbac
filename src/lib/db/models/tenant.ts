import { DataTypes, Model, Sequelize } from 'sequelize';

export class Tenant extends Model {
    declare id: string;
    declare name: string;
    declare slug: string;
    declare isActive: boolean;
    declare deletedAt: Date | null;
    declare createdAt: Date;
    declare updatedAt: Date;
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
