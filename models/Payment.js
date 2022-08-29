const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Payment extends Model {}

Payment.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    }, 

    payment_date:{
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    project_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "Project",
            key: "id"
        },
        onDelete: "cascade"
    }
},
    {
        sequelize,
        freezeTableName: true,
        hooks: {
            beforeCreate: userObj => {
                userObj.password = bcrypt.hashSync(userObj.password, 4);
                return userObj;
            }
        }
    });

module.exports = Payment