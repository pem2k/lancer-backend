const { Model, DataTypes } = require('sequelize');
const bcrypt = require("bcrypt")
const sequelize = require('../config/connection');

const phoneValidationRegex = /\d{3}-\d{3}-\d{4}/ 

class Client extends Model { }

Client.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    }, 

    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail:true
        }
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 32]
        }
    },

    company: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            validator: function(v) {
                return phoneValidationRegex.test(v); 
            },
        }
    }
}, {
    sequelize,
    freezeTableName: true,
    hooks: {
        beforeCreate: userObj => {
            userObj.password = bcrypt.hashSync(userObj.password, 4);
            return userObj;
        }
    }
});

module.exports = Client