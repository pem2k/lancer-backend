const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Project extends Model { }

Project.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    }, 
    
    project_name:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    project_status:{
        type: DataTypes.STRING,
        allowNull: true
    },

    initial_charge:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    balance:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 32]
        }
    },

    developer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Developer",
            key: "id"
        },
        onDelete: "cascade"
    },

    client_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Client",
            key: "id"
        },
        onDelete: "cascade"
    }
    
})

module.exports = Project