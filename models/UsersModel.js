const db = require("../services/mysql");
const { Model, DataTypes } = require("sequelize");

class Users extends Model {
    static getUser = async (data) => await Users.findOne({where: {...data}});
}

Users.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tablesId: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    }
}, {
    tableName: "users",
    modelName: "usersModel",
    sequelize: db,
    timestamps: true
});

// Users.sync();

module.exports = Users;