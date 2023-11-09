const { deleteWorkTimeInHours, addWorkTimeInHours, updateWorkTimeInHours } = require("../componets/generateWorkInfo");
const TableModel = require("../models/TableTimeModel");

class SubjectController {
    static createSubject = async (uid, req, res, next)=>{
        try{   
            let { classRoomsId="{}", longName, shortName, color=`rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`, tableId } = req.body;
            classRoomsId = JSON.parse(classRoomsId);
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const subjectId = Date.now();
                const subjects = JSON.parse(table.dataValues.subjects);
                let weekDays = JSON.parse(table.dataValues.weekDays);

                weekDays = addWorkTimeInHours({weekDays, id: subjectId});

                subjects[subjectId + ""] = {subjectId, longName, shortName, color, classRoomsId, wholeLessonsCount:0, lessons:{}};
                await TableModel.updateTable({id: tableId, userId: uid}, {subjects, weekDays});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateSubject = async (uid, req, res, next)=>{
        try{   
            let { longName, shortName, color, classRoomsId="{}", subjectId, tableId } = req.body;
            classRoomsId = JSON.parse(classRoomsId);

            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const subjects = JSON.parse(table.dataValues.subjects);
                if(subjects[subjectId + ""]){
                    const obj =  {};
                    if(longName) obj.longName = longName;
                    if(shortName) obj.shortName = shortName;
                    if(color) obj.color = color;
                    if(classRoomsId) obj.classRoomsId = classRoomsId;
                    subjects[subjectId + ""] = { ...subjects[subjectId + ""], ...obj };

                    await TableModel.updateTable({id: tableId, userId: uid}, {subjects});
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
    static updateSubjectWorkTimes = async (uid, req, res, next)=>{
        try{   
            let { workTimes="{}", subjectId, tableId } = req.body;
            workTimes = JSON.parse(workTimes);

            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const subjects = JSON.parse(table.dataValues.subjects);
                let weekDays = JSON.parse(table.dataValues.weekDays);

                const subject = subjects[subjectId + ""];
                if(subject){
                    weekDays = updateWorkTimeInHours({weekDays, workTimes, id: subjectId});
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
    static deleteSubject = async (uid, req, res, next)=>{
        try{   
            const { subjectId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                let {teachers, classes, lessons, subjects, classRooms, weekDays} = tableParsed;
                
                // Delete teacher by id
                const subject = subjects[subjectId + ""];
                if(subject){
                    delete subjects[subjectId + ""];
                    weekDays = deleteWorkTimeInHours({weekDays, id: subjectId});

                    // Delete lessons there is where this subjectId
                    Object.keys(subject.lessons).forEach((evt)=>{
                        const lesson = lessons[evt + ""];
                        
                        Object.keys(lesson.teachersId).forEach((e)=> {
                            delete teachers[e + ""].lessons[evt + ""];
                            teachers[e + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength; 
                        });
                        
                        Object.keys(lesson.classesId).forEach((e)=> {
                            delete classes[e + ""].lessons[evt + ""];
                            classes[e + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                            classes[e + ""].chapters[lesson.classesId[e + ""].chapterId][lesson.classesId[e + ""].groupId].groupWholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                        });

                        Object.keys(lesson.classRoomsId).forEach((e)=> {
                            delete classRooms[e + ""].lessons[evt + ""];
                            classRooms[e + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                        });
                        
                        // delete lesson from lessons 
                        delete lessons[evt + ""];
                    });
                    await TableModel.updateTable({id: tableId, userId: uid}, {classes, teachers, lessons, subjects, classRooms, weekDays});
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
}

module.exports = SubjectController;