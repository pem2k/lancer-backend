const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Deadline extends Model { }

Deadline.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    }, 

    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    deliverable:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    priority: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    project_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Project",
            key: "id"
        },
        onDelete: "cascade"
    }
})

module.exports = Deadline