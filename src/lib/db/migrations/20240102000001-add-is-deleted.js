'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('tenants', 'is_deleted', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        await queryInterface.addColumn('users', 'is_deleted', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        await queryInterface.addColumn('roles', 'is_deleted', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        await queryInterface.addColumn('settings', 'is_deleted', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('tenants', 'is_deleted');
        await queryInterface.removeColumn('users', 'is_deleted');
        await queryInterface.removeColumn('roles', 'is_deleted');
        await queryInterface.removeColumn('settings', 'is_deleted');
    },
};
