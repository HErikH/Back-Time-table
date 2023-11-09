const db = require("../services/mysql");
const { Model, DataTypes } = require("sequelize");

class TableModel extends Model {
    static getTablesByUserId = async (userId) => await TableModel.findAll({where: {userId}});
    static getTableById = async (id, userId) => await TableModel.findOne({where: {id, userId}});
    static updateTable = async ({id, userId}, data) => await TableModel.update(data, {where: {id, userId}});
    static createTable = async (data) => await TableModel.create(data);
    static deleteTable = async (id, userId) => await TableModel.destroy({where: {id, userId}});
}

TableModel.init({
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT
    },
    year: {
        type: DataTypes.TEXT
    },
    weekDaysCount: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        allowNull: false
    },
    daysHours: {
        type: DataTypes.INTEGER,
        defaultValue: 7,
        allowNull: false  
    },
    weekDays: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
    subjects: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
    classes: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
    classRooms: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
    teachers: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
    lessons: {
        type:  DataTypes.JSON,
        defaultValue: {},
        allowNull: false
    },
}, {
    tableName: "tables",
    modelName: "tablesModel",
    sequelize: db,
    timestamps: true
});

// TableModel.sync();

module.exports = TableModel;
