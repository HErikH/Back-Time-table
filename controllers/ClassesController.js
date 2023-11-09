const { addWorkTimeInHours, deleteWorkTimeInHours, updateWorkTimeInHours } = require("../componets/generateWorkInfo");
const TableModel = require("../models/TableTimeModel");

class ClassesController {
    static createClass = async (uid, req, res, next)=>{
        try{   
            let { longName, shortName, color=`rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`, classSupervisors="{}", tableId } = req.body;
            classSupervisors = JSON.parse(classSupervisors);
            const classSupervisorsKeys = Object.keys(classSupervisors);
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), weekDays: JSON.parse(table.dataValues.weekDays)};
                let {teachers, classes, weekDays} = tableParsed;
                const classId = Date.now();

                weekDays = addWorkTimeInHours({weekDays, id: classId});
                
                if(classSupervisorsKeys.length !== 0){
                    for(const idSupervsor of classSupervisorsKeys){
                        const teacher = teachers[idSupervsor + ""];
                        if(teacher){
                            teachers[idSupervsor + ""] = {...teacher, classIdWhoesSupervisor: {...teacher.classIdWhoesSupervisor, [classId + ""]: classId}};
                        }else{
                            delete classSupervisors[idSupervsor + ""];
                        }
                    }
                    classes[classId + ""] = {classId, longName, shortName, color, wholeLessonsCount:0, classSupervisors, chapters: {"all": {"all": {groupName: "all class", groupWholeLessonsCount: 0, groupMembersCount: 0}}}, lessons: {}};
                    await TableModel.updateTable({id: tableId, userId: uid}, {classes, teachers, weekDays});
                    
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                classes[classId + ""] = {classId, longName, shortName, color, wholeLessonsCount:0, classSupervisors, chapters: {"all": {"all": {groupName: "all class", groupWholeLessonsCount: 0, groupMembersCount: 0}}}, lessons: {}};
                await TableModel.updateTable({id: tableId, userId: uid}, {classes, weekDays});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateClass = async (uid, req, res, next)=>{
        try{   
            let { longName, shortName, color, classSupervisors="{}", classId, tableId } = req.body;
            classSupervisors = JSON.parse(classSupervisors);
            const classSupervisorsKeys = Object.keys(classSupervisors);
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const teachers = JSON.parse(table.dataValues.teachers);
                const classes = JSON.parse(table.dataValues.classes);
                const oldClassSupervsors = classes[classId + ""] ? classes[classId + ""].classSupervisors : null;
                if(oldClassSupervsors){
                    const oldClassSupervsorsKeys = Object.keys(oldClassSupervsors);

                    const newSupervisorsKeys = [];
                    const oldSupervisorsKeys = [];

                    oldClassSupervsorsKeys.forEach((evt)=> !classSupervisors[evt + ""] ? oldSupervisorsKeys.push(evt) : null );
                    classSupervisorsKeys.forEach((evt)=> !oldClassSupervsors[evt + ""] ? newSupervisorsKeys.push(evt) : null );
                    
                    // Delete from teachers classId who don't supvervisors
                    oldSupervisorsKeys.forEach((evt) => delete teachers[evt + ""].classIdWhoesSupervisor[classId + ""]);
                    // Add in teachers classId who supvervisors
                    newSupervisorsKeys.forEach((evt) => teachers[evt + ""] ? teachers[evt + ""].classIdWhoesSupervisor[classId + ""] = classId : delete classSupervisors[evt + ""]);

                    const obj = {};
                    if(longName) obj.longName = longName;
                    if(shortName) obj.shortName = shortName;
                    if(color) obj.color = color;
                    if(classSupervisors) obj.classSupervisors = classSupervisors;
                    classes[classId + ""] = {...classes[classId + ""], ...obj};

                    await TableModel.updateTable({id: tableId, userId: uid}, {classes, teachers});
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
    static updateClassWorkTimes = async (uid, req, res, next)=>{
        try{   
            let { workTimes="{}", classId, tableId } = req.body;
            workTimes = JSON.parse(workTimes);

            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classes = JSON.parse(table.dataValues.classes);
                let weekDays = JSON.parse(table.dataValues.weekDays);

                const clas = classes[classId + ""];
                if(clas){
                    weekDays = updateWorkTimeInHours({weekDays, workTimes, id: classId});
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
    static addChapter = async (uid, req, res, next)=>{
        try{   
            let { chapter="{}", classId, tableId } = req.body;
            chapter = JSON.parse(chapter);
            // chapter = {
            //     "895487": {
            //         groupName: "txaner",
            //         groupWholeLessonsCount: 0,
            //         groupMembersCount: 0
            //     },
            //     "91674887": {
            //         groupName: "axchikner",
            //         groupWholeLessonsCount: 0,
            //         groupMembersCount: 0
            //     }
            // }
            if(Object.keys(chapter).length === 0){
                return res.json({errorMessage: "don't passed chapter"});
            }
            
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classes = JSON.parse(table.dataValues.classes);
                const classChapters = classes[classId + ""] ? classes[classId + ""].chapters : null;
                if(classChapters){
                    classes[classId + ""].chapters = {...classChapters, [Date.now() + ""]: chapter};
                    await TableModel.updateTable({id: tableId, userId: uid}, {classes});
                    
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({errorMessage: "wrong class id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateChapter = async (uid, req, res, next)=>{
        try{   
            let { chapter="{}", chapterId, classId, tableId } = req.body;
            chapter = JSON.parse(chapter);
            // chapterId = "all"
            // chapter = {
            //     "all": {
            //     groupName: "all class",
            //     groupWholeLessonsCount: 4,
            //     groupMembersCount: 0
            // }
            if(!chapterId){
                return res.json({errorMessage: "don't passed chapter id"});
            }
            if(Object.keys(chapter).length === 0){
                return res.json({errorMessage: "don't passed chapter"});
            }
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classes = JSON.parse(table.dataValues.classes);
                const classChapters = classes[classId + ""] ? classes[classId + ""].chapters : null;
                if(classChapters){
                    if(classChapters[chapterId + ""]){
                        classes[classId + ""].chapters[chapterId + ""] = chapter;
                        await TableModel.updateTable({id: tableId, userId: uid}, {classes});
                    
                        const newTable = await TableModel.getTableById(tableId, uid);
                        return res.json({table: newTable});
                    }
                    return res.json({errorMessage: "wrong chapter id"});
                }
                return res.json({errorMessage: "wrong class id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteChatper = async (uid, req, res, next)=>{
        try{   
            const { chapterId, classId, tableId } = req.body;
    
            if(!chapterId){
                return res.json({errorMessage: "don't passed chapter id"});
            }
            if(chapterId === "all"){
                return res.json({errorMessage: "don't delete all chapter"});
            }
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const classes = JSON.parse(table.dataValues.classes);
                const clas = classes[classId + ""] ? classes[classId + ""] : null;
                if(clas){
                    if(clas.chapters[chapterId + ""]){
                        delete classes[classId + ""].chapters[chapterId + ""];
                        await TableModel.updateTable({id: tableId, userId: uid}, {classes});
                    
                        const newTable = await TableModel.getTableById(tableId, uid);
                        return res.json({table: newTable});
                    }
                    return res.json({errorMessage: "wrong chapter id"});
                }
                return res.json({errorMessage: "wrong class id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteClass = async (uid, req, res, next)=>{
        try{   
            const { classId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                let {teachers, classes, lessons, subjects, classRooms, weekDays} = tableParsed;
                
                // Delete class by id
                const clas = classes[classId + ""];
                if(clas){
                    delete classes[classId + ""];
                    weekDays = deleteWorkTimeInHours({weekDays, id: classId});

                    // Delete classId from teachers "classdWhoesSupervisors"
                    Object.keys(clas.classSupervisors).forEach((evt) => delete teachers[evt + ""].classIdWhoesSupervisor[classId + ""]);
                    
                    // Delete lessons there is where this classId
                    Object.keys(clas.lessons).forEach((evt)=>{
                        const lesson = lessons[evt + ""];

                        if((Object.keys(lesson.classesId).length - 1) >= 1){
                            // delete classId from lessons.classesId
                            delete lessons[evt + ""].classesId[classId + ""];
                        }else{
                            delete subjects[lesson.subjectId + ""].lessons[evt + ""];
                            subjects[lesson.subjectId + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;

                            Object.keys(lesson.teachersId).forEach((e)=> {
                                delete teachers[e + ""].lessons[evt + ""];
                                teachers[e + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength; 
                            });

                            Object.keys(lesson.classRoomsId).forEach((e)=> {
                                delete classRooms[e + ""].lessons[evt + ""];
                                classRooms[e + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                            });

                            // delete lesson from lessons 
                            delete lessons[evt + ""];
                        }
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

module.exports = ClassesController;