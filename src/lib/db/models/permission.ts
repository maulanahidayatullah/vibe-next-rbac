import { DataTypes, Model, Sequelize } from 'sequelize';

export class Permission extends Model {
    declare id: string;
    declare name: string;
    declare slug: string;
    declare module: string;
    declare description: string | null;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export function initPermission(sequelize: Sequelize) {
    Permission.init(
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
            module: {
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
            modelName: 'Permission',
            tableName: 'permissions',
            underscored: true,
        }
    );
}
