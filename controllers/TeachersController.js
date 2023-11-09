const { addWorkTimeInHours, deleteWorkTimeInHours, updateWorkTimeInHours } = require("../componets/generateWorkInfo");
const TableModel = require("../models/TableTimeModel");

class TeachersController {
    static createTeacher = async (uid, req, res, next)=>{
        try{   
            let { name, lastName, shortName, email="", phone="", classRoomsId="{}", gender="female", classIdWhoesSupervisor="{}", color=`rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 10)}, ${Math.floor(Math.random() * 10)})`, tableId } = req.body;
            classIdWhoesSupervisor = JSON.parse(classIdWhoesSupervisor);
            classRoomsId = JSON.parse(classRoomsId);

            const classIdWhoesSupervisorKeys = Object.keys(classIdWhoesSupervisor);
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), weekDays: JSON.parse(table.dataValues.weekDays)};
                let {teachers, classes, weekDays} = tableParsed;
                const teacherId = Date.now();
                
                weekDays = addWorkTimeInHours({weekDays, id: teacherId});

                if(classIdWhoesSupervisorKeys.length !== 0){
                    for(const idClass of classIdWhoesSupervisorKeys){
                        const clas = classes[idClass + ""];
                        if(clas){
                            classes[idClass + ""] = {...clas, classSupervisors: {...clas.classSupervisors, [teacherId + ""]: teacherId}};
                        }else{
                            delete classIdWhoesSupervisor[idClass + ""];
                        }
                    }
                    teachers[teacherId + ""] = {teacherId, name, lastName, shortName, email, phone, classIdWhoesSupervisor, classRoomsId, gender, color, wholeLessonsCount:0, lessons: {}};
                    await TableModel.updateTable({id: tableId, userId: uid}, {classes, teachers, weekDays});
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                teachers[teacherId + ""] = {teacherId, name, lastName, shortName, email, phone, classIdWhoesSupervisor, classRoomsId, gender, color, wholeLessonsCount:0, lessons: {}};
                await TableModel.updateTable({id: tableId, userId: uid}, {teachers, weekDays});
                
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static updateTeacher = async (uid, req, res, next)=>{
        try{   
            let { teacherId, name, lastName, shortName, email, phone, classIdWhoesSupervisor="{}", classRoomsId="{}", gender, color, tableId } = req.body;
            classIdWhoesSupervisor = JSON.parse(classIdWhoesSupervisor);
            classRoomsId = JSON.parse(classRoomsId);
            const classIdWhoesSupervisorKeys = Object.keys(classIdWhoesSupervisor);
            
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const teachers = JSON.parse(table.dataValues.teachers);
                const classes = JSON.parse(table.dataValues.classes);

                const oldClassWhoesSupervsors = teachers[teacherId + ""] ? teachers[teacherId + ""].classIdWhoesSupervisor : null;
                if(oldClassWhoesSupervsors){
                    const oldClassWhoesSupervsorsKeys = Object.keys(oldClassWhoesSupervsors);

                    const newClassWhoesSupervisorsKeys = [];
                    const oldClassWhoesSupervisorsKeys = [];

                    oldClassWhoesSupervsorsKeys.forEach((evt)=> !classIdWhoesSupervisor[evt + ""] ? oldClassWhoesSupervisorsKeys.push(evt) : null );
                    classIdWhoesSupervisorKeys.forEach((evt)=> !oldClassWhoesSupervsors[evt + ""] ? newClassWhoesSupervisorsKeys.push(evt) : null );
                    
                    // Delete from classes teacherId who don't supvervisors
                    oldClassWhoesSupervisorsKeys.forEach((evt) => delete classes[evt + ""].classSupervisors[teacherId + ""]);
                    // Add in classes teacherId who supvervisors
                    newClassWhoesSupervisorsKeys.forEach((evt) => classes[evt + ""] ? classes[evt + ""].classSupervisors[teacherId + ""] = teacherId : delete classIdWhoesSupervisor[evt + ""]);

                    const obj = {};
                    if(name) obj.name = name;
                    if(lastName) obj.lastName = lastName;
                    if(shortName) obj.shortName = shortName;
                    if(email) obj.email = email;
                    if(phone) obj.phone = phone;
                    if(color) obj.color = color;
                    if(gender) obj.gender = gender;
                    if(classIdWhoesSupervisor) obj.classIdWhoesSupervisor = classIdWhoesSupervisor;
                    if(classRoomsId) obj.classRoomsId = classRoomsId;
                    teachers[teacherId + ""] = {...teachers[teacherId + ""], ...obj};

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
    static updateTeacherWorkTimes = async (uid, req, res, next)=>{
        try{   
            let { workTimes="{}", teacherId, tableId } = req.body;
            workTimes = JSON.parse(workTimes);

            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const teachers = JSON.parse(table.dataValues.teachers);
                let weekDays = JSON.parse(table.dataValues.weekDays);

                const teacher = teachers[teacherId + ""];
                if(teacher){
                    weekDays = updateWorkTimeInHours({weekDays, workTimes, id: teacherId});
                    await TableModel.updateTable({id: tableId, userId: uid}, {weekDays});
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({errorMessage: "wrong teacher id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteTeacher = async (uid, req, res, next)=>{
        try{   
            const { teacherId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                let {teachers, classes, lessons, subjects, classRooms, weekDays} = tableParsed;
                
                // Get teacher by id
                const teacher = teachers[teacherId + ""];
                if(teacher){
                    // Delete teacher by id
                    delete teachers[teacherId + ""];
                    weekDays = deleteWorkTimeInHours({weekDays, id: teacherId});

                    // Delete teacherId from classes "classSupervisors"
                    Object.keys(teacher.classIdWhoesSupervisor).forEach((evt) => delete classes[evt + ""].classSupervisors[teacherId + ""]);

                    // Delete lessons there is where this teacherId
                    Object.keys(teacher.lessons).forEach((evt)=>{
                        const lesson = lessons[evt + ""];

                        if((Object.keys(lesson.teachersId).length - 1) >= 1){
                            // delete teacherId from lessons.teachersId
                            delete lessons[evt + ""].teachersId[teacherId + ""];
                        }else{
                            delete subjects[lesson.subjectId + ""].lessons[evt + ""];
                            subjects[lesson.subjectId + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;

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
                        }
                    });

                    await TableModel.updateTable({id: tableId, userId: uid}, {classes, teachers, lessons, subjects, classRooms, weekDays});
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }
                return res.json({errorMessage: "wrong teacher id"});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
}

module.exports = TeachersController;