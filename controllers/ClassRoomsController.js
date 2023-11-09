const { addWorkTimeInHours, deleteWorkTimeInHours, updateWorkTimeInHours } = require("../componets/generateWorkInfo");
const TableModel = require("../models/TableTimeModel");

class ClassRoomsController {
    static createClassRoom = async (uid, req, res, next)=>{
        try{   
            const { longName, shortName, color=`rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                let weekDays = JSON.parse(table.dataValues.weekDays);
                const classRooms = JSON.parse(table.dataValues.classRooms);
                const classRoomId = Date.now();

                weekDays = addWorkTimeInHours({weekDays, id: classRoomId});
                classRooms[classRoomId + ""] = {classRoomId, longName, shortName, color, wholeLessonsCount:0, lessonsCount:0, lessons: {}};
                await TableModel.updateTable({id: tableId, userId: uid}, {classRooms, weekDays});
                
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateClassRoom = async (uid, req, res, next)=>{
        try{   
            const { longName, shortName, color, classRoomId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classRooms = JSON.parse(table.dataValues.classRooms);
                if(classRooms[classRoomId + ""]){
                    
                    const obj =  {};
                    if(longName) obj.longName = longName;
                    if(shortName) obj.shortName = shortName;
                    if(color) obj.color = color;
                    
                    classRooms[classRoomId + ""] = { ...classRooms[classRoomId + ""], ...obj };
                    await TableModel.updateTable({id: tableId, userId: uid}, {classRooms});
                    
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({table});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateClassRoomWorkTimes = async (uid, req, res, next)=>{
        try{   
            let { workTimes="{}", classRoomId, tableId } = req.body;
            workTimes = JSON.parse(workTimes);

            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classRooms = JSON.parse(table.dataValues.classRooms);
                let weekDays = JSON.parse(table.dataValues.weekDays);

                const classRoom = classRooms[classRoomId + ""];
                if(classRoom){
                    weekDays = updateWorkTimeInHours({weekDays, workTimes, id: classRoomId});
                    await TableModel.updateTable({id: tableId, userId: uid}, {weekDays});
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({errorMessage: "wrong subject id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteClassRoom = async (uid, req, res, next)=>{
        try{   
            const { classRoomId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), classRooms: JSON.parse(table.dataValues.classRooms)};
                let { lessons, classRooms, weekDays } = tableParsed;

                // Get classRoom by id
                const classRoom = classRooms[classRoomId + ""];
                if(classRoom){
                    // Delete classRoom by id
                    delete classRooms[classRoomId + ""];
                    weekDays = deleteWorkTimeInHours({weekDays, id: classRoomId});

                    // Delete from lessons there is where this classRoomdId
                    Object.keys(classRoom.lessons).forEach((evt)=>{
                        delete lessons[evt + ""].classRoomsId[classRoomId + ""];
                    });

                    await TableModel.updateTable({id: tableId, userId: uid}, {lessons, classRooms, weekDays});
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({errorMessage: "wrong classRoom id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
}

module.exports = ClassRoomsController;