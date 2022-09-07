const { Model, DataTypes} = require('sequelize')
const sequelize = require('../config/connection');
const bcrypt = require("bcrypt")

class Appointment extends Model { }

Appointment.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    appointment_name:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    appointment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },

    appointment_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    
    appointment_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    appointment_memo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    appointment_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    project_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Project",
            key: "id"
        },
        onDelete: "cascade"
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
    
},
{
    sequelize,
    freezeTableName: true,
    hooks:{
        beforeCreate: userObj => {
            userObj.pasword = bcrypt.hashSync(userObj.password,4)
            return userObj;
        }
    }
});

module.exports = Appointment