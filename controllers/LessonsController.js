const { checkWorkTime } = require("../componets/generateWorkInfo");
const TableModel = require("../models/TableTimeModel");

class LessonsController {
    static createLesson = async (uid, req, res, next)=>{
        try{   
            let { tableId, subjectId, teachersId="{}", classesId="{}", classRoomsId="{}", lessonsCount=1, lessonsLength=1 } = req.body;
            teachersId = JSON.parse(teachersId);
            classesId = JSON.parse(classesId);
            classRoomsId = JSON.parse(classRoomsId);
            const teachersKeys = Object.keys(teachersId);
            const classesKeys = Object.keys(classesId);
            // teachersId = {"1": 1, "3": 3}
            // classRoomsId = {"2": 2, "3": 3}
            // classesId = {
                // "1": {
                    // chapterId: "all"
                    // groupId: "all"
                // }
                // "2": {
                    // chapterId: "all"
                    // groupId: "all"
                // }
            // }
            if(tableId && teachersKeys.length !== 0 && subjectId && classesKeys.length !== 0){
                const table = await TableModel.getTableById(tableId, uid);
                if(table){
                    const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                    const {teachers, classes, lessons, subjects, classRooms} = tableParsed;
                    const lessonId = Date.now();

                    if(!subjects[subjectId + ""]){
                        throw {message: "don't right subjectId"};
                    }

                    subjects[subjectId + ""].lessons[lessonId + ""] = lessonId;
                    subjects[subjectId + ""].wholeLessonsCount += +lessonsCount * +lessonsLength;

                    teachersKeys.forEach((evt)=>{
                        if(!teachers[evt + ""]){
                            throw {message: "don't right teacherId"};
                        }
                        teachers[evt + ""].lessons[lessonId + ""] = lessonId;
                        teachers[evt + ""].wholeLessonsCount += +lessonsCount * +lessonsLength;
                    });

                    classesKeys.forEach((evt)=>{
                        if(!classes[evt + ""]){
                            throw {message: "don't right classId"};
                        }
                        if(!classesId[evt + ""].chapterId || !classesId[evt + ""].groupId){
                            throw {message: "don't passed in classId chapterId or groupId"};
                        }
                        if(!classes[evt + ""].chapters[classesId[evt + ""].chapterId]){
                            throw {message: "don't right chapter id"};
                        }
                        if(!classes[evt + ""].chapters[classesId[evt + ""].chapterId][classesId[evt + ""].groupId]){
                            throw {message: "don't right group id"};
                        }
                        classes[evt + ""].lessons[lessonId + ""] = lessonId;
                        classes[evt + ""].wholeLessonsCount += +lessonsCount * +lessonsLength;
                        classes[evt + ""].chapters[classesId[evt + ""].chapterId][classesId[evt + ""].groupId].groupWholeLessonsCount += +lessonsCount * +lessonsLength;
                    });

                    Object.keys(classRoomsId).forEach((evt)=> {
                        if(!classRooms[evt + ""]){
                            throw {message: "don't right classRoomId"};
                        }
                        classRooms[evt + ""].lessons[lessonId + ""] = lessonId;
                        classRooms[evt + ""].wholeLessonsCount += +lessonsCount * +lessonsLength;
                    });
                    
                    lessons[lessonId + ""] = {lessonId, teachersId, subjectId, classesId, classRoomsId, lessonsCount, lessonsLength, places: {}};
                    await TableModel.updateTable({id: tableId, userId: uid}, {lessons, subjects, teachers, classes, classRooms});
                    
                    const newTable = await TableModel.getTableById(tableId, uid);
                    return res.json({table: newTable});
                }

                return res.json({errorMessage: "wrong table id"});
            }
            return res.json({errorMessage: "not full writed form for create lesson"});
        }catch(err){
            return next(err);
        }
    }
    static updateLesson = async (uid, req, res, next)=>{
        try{   
            let { lessonId, tableId, subjectId, teachersId="{}", classesId="{}", classRoomsId="{}", lessonsCount, lessonsLength } = req.body;
            teachersId = JSON.parse(teachersId);
            classesId = JSON.parse(classesId);
            classRoomsId = JSON.parse(classRoomsId);
            const classRoomsIdKeys = Object.keys(classRoomsId);
            const classRoomsIdsKeys = [];
            const teachersIdKeys = Object.keys(teachersId);
            const teachersIdsKeys = [];
            const classesIdKeys = Object.keys(classesId);
            const classesIdsKeys = [];
            
            if(classesIdKeys.length === 0 || teachersIdKeys.length === 0){
                return res.json({errorMessage: "don't passed teachersId or classesId"});
            }
            const table = await TableModel.getTableById(tableId, uid);
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                const {teachers, classes, lessons, subjects, classRooms} = tableParsed;
                const lesson = lessons[lessonId + ""];

                if(!lesson){
                    return res.json({errorMessage: "wrong lesson id"});
                }
                // Update subject if there is passed subjectId
                if(subjectId && +subjectId !== +lesson.subjectId){
                    if(subjects[subjectId + ""]){
                        subjects[subjectId + ""].lessons[lessonId + ""] = lessonId;
                        subjects[subjectId + ""].wholeLessonsCount += +(lessonsCount || +lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength);
                    }else{
                        throw {message: "don't right subjectId"};
                    }

                    delete subjects[lesson.subjectId + ""].lessons[lessonId + ""];
                    subjects[lesson.subjectId + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                }
                // Update teacher if there is passed teacherId
                if(teachersId){
                    const oldTeachersId = lesson.teachersId;
                    const oldTeachersIdKeys = Object.keys(oldTeachersId);

                    const newTeachersIdKeys = [];
                    const oldTeachersIdsKeys = [];

                    oldTeachersIdKeys.forEach((evt)=> !teachersId[evt + ""] ? oldTeachersIdsKeys.push(evt) : teachersIdsKeys.push(evt));
                    teachersIdKeys.forEach((evt)=> !oldTeachersId[evt + ""] ? newTeachersIdKeys.push(evt) : null );
                    
                    // Delete from teachers.lessons lessonId where there is this lessonId and update wholeLessonsCount
                    oldTeachersIdsKeys.forEach((evt) => {
                        delete teachers[evt + ""].lessons[lessonId + ""];
                        teachers[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                    });
                    // Add in teachers.lessons lessonId and update wholeLessonsCount
                    newTeachersIdKeys.forEach((evt) => {
                        if(!teachers[evt + ""]){
                            throw {message: "don't right teacherId"};
                        }
                        teachers[evt + ""].lessons[lessonId + ""] = lessonId;
                        teachers[evt + ""].wholeLessonsCount += +(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength);
                    });
                }
                // Update class if there is passed classId
                if(classesId){
                    const oldClassesId = lesson.classesId;
                    const oldClassesIdKeys = Object.keys(oldClassesId);

                    const newClassesIdKeys = [];
                    const oldClassesIdsKeys = [];

                    oldClassesIdKeys.forEach((evt)=> !classesId[evt + ""] ? oldClassesIdsKeys.push(evt) : classesIdsKeys.push(evt) );
                    classesIdKeys.forEach((evt)=> !oldClassesId[evt + ""] ? newClassesIdKeys.push(evt) : null );
                    
                    // Add in classes.lessons lessonId and update wholeLessonsCount
                    newClassesIdKeys.forEach((evt) => {
                        if(!classes[evt + ""]){
                            throw {status: 404, message: "wrong class id"};
                        }
                        if(!classes[evt + ""].chapters[classesId[evt + ""].chapterId]){
                            throw {status: 404, message: "wrong chapter id"};
                        }
                        if(!classes[evt + ""].chapters[classesId[evt + ""].chapterId][classesId[evt + ""].groupId]){
                            throw {status: 404, message: "wrong group id"};
                        }
                        classes[evt + ""].lessons[lessonId + ""] = lessonId;
                        classes[evt + ""].wholeLessonsCount += +(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength);
                        classes[evt + ""].chapters[classesId[evt + ""].chapterId][classesId[evt + ""].groupId].groupWholeLessonsCount += +(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength);
                    });

                    // Delete from classes.lessons lessonId where there is this lessonId and update wholeLessonsCount
                    oldClassesIdsKeys.forEach((evt) => {
                        delete classes[evt + ""].lessons[lessonId + ""];
                        classes[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                        classes[evt + ""].chapters[lesson.classesId[evt + ""].chapterId][lesson.classesId[evt + ""].groupId].groupWholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                    });

                    // Test do change chapter or group in classesId?
                    classesIdsKeys.forEach((evt)=>{
                        const newClassOption = classesId[evt + ""];
                        const oldClassOption = oldClassesId[evt + ""];

                        if(oldClassOption.chapterId !== newClassOption.chapterId || oldClassOption.groupId !== newClassOption.groupId){
                            if(!classes[evt + ""].chapters[newClassOption.chapterId]){
                                throw {status: 404, message: "wrong chapter id"};
                            }
                            if(!classes[evt + ""].chapters[newClassOption.chapterId][newClassOption.groupId]){
                                throw {status: 404, message: "wrong group id"};
                            }
                            // delete from old groupWholeLessonsCount this lesson count
                            classes[evt + ""].chapters[oldClassOption.chapterId][oldClassOption.groupId].groupWholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                            // add in new groupWholeLessonsCount this lesson count
                            classes[evt + ""].chapters[newClassOption.chapterId][newClassOption.groupId].groupWholeLessonsCount += (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength));
                            // delete and update chatper group in lesson.classes
                            lesson.classesId[evt + ""] = classesId[evt + ""];
                            return;
                        }

                        if(lessonsCount || lessonsLength){
                            classes[evt + ""].chapters[newClassOption.chapterId][newClassOption.groupId].groupWholeLessonsCount = (+(+classes[evt + ""].chapters[newClassOption.chapterId][newClassOption.groupId].groupWholeLessonsCount - (+lesson.lessonsCount * +lesson.lessonsLength)) + (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength)));
                        }
                    });
                }
                // Update classRooms if there is passed classId
                if(classRoomsId){
                    const oldclassRoomsId = lesson.classRoomsId;
                    const oldclassRoomsIdKeys = Object.keys(oldclassRoomsId);

                    const newClassRoomsIdKeys = [];
                    const oldClassRoomsIdKeys = [];

                    oldclassRoomsIdKeys.forEach((evt)=> !classRoomsId[evt + ""] ? oldClassRoomsIdKeys.push(evt) : classRoomsIdsKeys.push(evt) );
                    classRoomsIdKeys.forEach((evt)=> !oldclassRoomsId[evt + ""] ? newClassRoomsIdKeys.push(evt) : null );
                    
                    // Delete from classRooms.lessons lessonId where there is this lessonId and update wholeLessonsCount
                    oldClassRoomsIdKeys.forEach((evt) => {
                        delete classRooms[evt + ""].lessons[lessonId + ""];
                        classRooms[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                        classRooms[evt + ""].lessonsCount -= Object.keys(lesson.places).length * +lesson.lessonsLength;
                    });
                    // Add in classRooms.lessons lessonId and update wholeLessonsCount
                    newClassRoomsIdKeys.forEach((evt) => {
                        if(!classRooms[evt + ""]){
                            throw {message: "don't right classRoomId"};
                        }
                        classRooms[evt + ""].lessons[lessonId + ""] = lessonId;
                        classRooms[evt + ""].wholeLessonsCount += +(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength);
                    });
                }
                if((lessonsCount && +lessonsCount !== +lesson.lessonsCount) || (lessonsLength && +lessonsLength !== +lesson.lessonsLength)){
                    if(!subjectId || +subjectId === +lesson.subjectId){
                        subjects[lesson.subjectId + ""].wholeLessonsCount = (+subjects[lesson.subjectId + ""].wholeLessonsCount - +lesson.lessonsCount) + (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength));
                    }
                    teachersIdsKeys.forEach((evt)=>{
                        teachers[evt + ""].wholeLessonsCount = (+teachers[evt + ""].wholeLessonsCount - +(+lesson.lessonsCount * +lesson.lessonsLength)) + (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength));
                    });
                    classesIdsKeys.forEach((evt)=>{
                        classes[evt + ""].wholeLessonsCount = (+classes[evt + ""].wholeLessonsCount - +(+lesson.lessonsCount * +lesson.lessonsLength)) + (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength));
                    });
                    classRoomsIdsKeys.forEach((evt)=>{
                        classRooms[evt + ""].wholeLessonsCount = (+classRooms[evt + ""].wholeLessonsCount - +(+lesson.lessonsCount * +lesson.lessonsLength)) + (+(lessonsCount || lesson.lessonsCount) * +(lessonsLength || lesson.lessonsLength));
                        classRooms[evt + ""].lessonsCount -= Object.keys(lesson.places).length * +lesson.lessonsLength;
                    });
                }

                const obj = {};
                if(lessonsCount) obj.lessonsCount = lessonsCount;
                if(lessonsLength) obj.lessonsLength = lessonsLength;
                if(teachersId) obj.teachersId = teachersId;
                if(subjectId) obj.subjectId = subjectId;
                if(classesId) obj.classesId = classesId;
                if(classRoomsId) obj.classRoomsId = classRoomsId;
                obj.places = {};
                lessons[lessonId + ""] = {...lesson, ...obj};
                await TableModel.updateTable({id: tableId, userId: uid}, {lessons, teachers, subjects, classes, classRooms});
                
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static putLessonWithoutError = async (uid, req, res, next)=>{
        try{   
            const { lessonId, tableId, classId, dayId, hourId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);

            if(table){
                if(!dayId || +dayId < 1 || +dayId > +table.dataValues.weekDaysCount){
                    return res.json({errorMessage: "not passed day id or big or small 1-" + table.dataValues.weekDaysCount});
                }
                if(!hourId || +hourId < 1 || +hourId > +table.dataValues.daysHours){
                    return res.json({errorMessage: "not passed hour id or big or small 1-" + table.dataValues.daysHours});
                }

                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), classRooms: JSON.parse(table.dataValues.classRooms)};
                const {lessons, classRooms, weekDays, teachers} = tableParsed;
                const lesson = lessons[lessonId + ""];  
                if(!lesson){
                    return res.json({errorMessage: "wrong lesson id"});
                }

                // test does this lesson fit here?
                if((+hourId + (+lesson.lessonsLength - 1)) > +table.dataValues.daysHours ){
                    return res.json({errorMessage: "this lesson does not fit here"});
                }

                // test does this lesson have more lesson?
                if(+lesson.lessonsCount <= Object.keys(lesson.places).length){
                    return res.json({errorMessage: "this lesson don't have more lesson"});
                }

                const possibleWorkTimes = {
                    classesId: {},
                    teachersId: {},
                    classRoomsId: {}
                };
                const not_availableWorkTimes = {
                    classesId: {},
                    teachersId: {},
                    classRoomsId: {}
                };
                const errorWithClassRoom = {};
                const classKeys = Object.keys(lesson.classesId);
                const teacherKeys = Object.keys(lesson.teachersId);
                const classRoomKeys = Object.keys(lesson.classRoomsId);

                // test click on class, there is clicked class in this lesson classes?
                for(const index in classKeys){
                    if(classId == classKeys[index]){
                        break;
                    }
                    if(index === (classKeys.length - 1)){
                        throw {message: "there isn't this class in list lesson classes"};
                    }
                }

                // test
                const errorsWithTeachers = [];
                const lastHourId = +hourId + (+lesson.lessonsLength - 1);

                teacherKeys.forEach((teacherId)=>{
                    Object.keys(teachers[teacherId].lessons).forEach((lessId)=>{
                        const thisLesson = lessons[lessId];

                        Object.keys(thisLesson.places).forEach((placeId)=>{
                            const placeStartHourId = +thisLesson.places[placeId].hourId;
                            const placeEndHourId = +thisLesson.places[placeId].hourId + (+thisLesson.lessonsLength - 1);

                            if(thisLesson.places[placeId].dayId == dayId && (placeStartHourId == hourId || (+hourId > placeStartHourId ? lastHourId <= placeEndHourId ? true : false : +hourId < placeStartHourId ? lastHourId >= placeStartHourId ? true : false : false))){
                                errorsWithTeachers.push({...thisLesson, placeId});
                            }
                        });
                    });
                });

                if(errorsWithTeachers.length > 0){
                    return res.json({errorMessage: "this lesson teacher(s) have lesson in this dayId and hourId", errorsWithTeachers});
                }

                // test work times

                const stateSubject = checkWorkTime({weekDays, id: lesson.subjectId, dayId, hourId, lessonLength: lesson.lessonsLength});
                possibleWorkTimes.subjectId = stateSubject.possible;
                not_availableWorkTimes.subjectId = stateSubject.not_available;

                classKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.classesId = {...possibleWorkTimes.classesId, ...state.possible};
                    not_availableWorkTimes.classesId = {...possibleWorkTimes.classesId, ...state.not_available};
                });
                teacherKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.teachersId = {...possibleWorkTimes.teachersId, ...state.possible};
                    not_availableWorkTimes.teachersId = {...possibleWorkTimes.teachersId, ...state.not_available};
                });
                classRoomKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.classRoomsId = {...possibleWorkTimes.classRoomsId, ...state.possible};
                    not_availableWorkTimes.classRoomsId = {...possibleWorkTimes.classRoomsId, ...state.not_available};
                    classRooms[id].lessonsCount += 1 * +lesson.lessonsLength;

                    Object.keys(classRooms[id].lessons).forEach((lessId)=>{
                        const thisLesson = lessons[lessId];
                        Object.keys(thisLesson.places).forEach((placeId)=>{
                            const placeStartHourId = +thisLesson.places[placeId].hourId;
                            const placeEndHourId = +thisLesson.places[placeId].hourId + (+thisLesson.lessonsLength - 1);

                            if(thisLesson.places[placeId].dayId == dayId && (placeStartHourId == hourId || (+hourId > placeStartHourId ? lastHourId <= placeEndHourId ? true : false : +hourId < placeStartHourId ? lastHourId >= placeStartHourId ? true : false : false))){
                                errorWithClassRoom[id + ""] = id;
                            }
                        });
                    });
                });
                const placeId = Date.now() + "";
                lesson.places[placeId] = {placeId, dayId, hourId, errorWithClassRoom, possibleWorkTimes, not_availableWorkTimes};
                await TableModel.updateTable({id: tableId, userId: uid}, {lessons});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static putLessonWithError = async (uid, req, res, next)=>{
        try{   
            const { lessonId, tableId, classId, dayId, hourId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            
            if(table){
                if(!dayId || +dayId < 1 || +dayId > +table.dataValues.weekDaysCount){
                    return res.json({errorMessage: "not passed day id or big or small 1-" + table.dataValues.weekDaysCount});
                }
                if(!hourId || +hourId < 1 || +hourId > +table.dataValues.daysHours){
                    return res.json({errorMessage: "not passed hour id or big or small 1-" + table.dataValues.daysHours});
                }
                const tableParsed = { weekDays: JSON.parse(table.dataValues.weekDays), lessons: JSON.parse(table.dataValues.lessons), classRooms: JSON.parse(table.dataValues.classRooms)};
                const { lessons, classRooms, weekDays} = tableParsed;
                const lesson = lessons[lessonId + ""];  
                if(!lesson){
                    return res.json({errorMessage: "wrong lesson id"});
                }

                // test does this lesson fit here?
                if((+hourId + (+lesson.lessonsLength - 1)) > +table.dataValues.daysHours ){
                    return res.json({errorMessage: "this lesson does not fit here"});
                }

                // test does this lesson have more lesson?
                if(+lesson.lessonsCount <= Object.keys(lesson.places).length){
                    return res.json({errorMessage: "this lesson don't have more lesson"});
                }

                const possibleWorkTimes = {
                    classesId: {},
                    teachersId: {},
                    classRoomsId: {}
                };
                const not_availableWorkTimes = {
                    classesId: {},
                    teachersId: {},
                    classRoomsId: {}
                };
                const errorWithClassRoom = {};
                const classKeys = Object.keys(lesson.classesId);
                const teacherKeys = Object.keys(lesson.teachersId);
                const classRoomKeys = Object.keys(lesson.classRoomsId);

                // test click on class, there is clicked class in this lesson classes?
                for(const index in classKeys){
                    if(classId == classKeys[index]){
                        break;
                    }
                    if(index === (classKeys.length - 1)){
                        throw {message: "there isn't this class in list lesson classes"};
                    }
                } 

                // test work times

                const stateSubject = checkWorkTime({weekDays, id: lesson.subjectId, dayId, hourId, lessonLength: lesson.lessonsLength});
                possibleWorkTimes.subjectId = stateSubject.possible;
                not_availableWorkTimes.subjectId = stateSubject.not_available;

                classKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.classesId = {...possibleWorkTimes.classesId, ...state.possible};
                    not_availableWorkTimes.classesId = {...possibleWorkTimes.classesId, ...state.not_available};
                });
                teacherKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.teachersId = {...possibleWorkTimes.teachersId, ...state.possible};
                    not_availableWorkTimes.teachersId = {...possibleWorkTimes.teachersId, ...state.not_available};
                });
                classRoomKeys.forEach((id)=>{
                    const state = checkWorkTime({weekDays, id, dayId, hourId, lessonLength: lesson.lessonsLength});
                    possibleWorkTimes.classRoomsId = {...possibleWorkTimes.classRoomsId, ...state.possible};
                    not_availableWorkTimes.classRoomsId = {...possibleWorkTimes.classRoomsId, ...state.not_available};
                    classRooms[id].lessonsCount += 1 * +lesson.lessonsLength;

                    Object.keys(classRooms[id].lessons).forEach((lessId)=>{
                        const thisLesson = lessons[lessId];
                        const lastHourId = +hourId + (+lesson.lessonsLength - 1);
                        Object.keys(thisLesson.places).forEach((placeId)=>{
                            const placeStartHourId = +thisLesson.places[placeId].hourId;
                            const placeEndHourId = +thisLesson.places[placeId].hourId + (+thisLesson.lessonsLength - 1);

                            if(thisLesson.places[placeId].dayId == dayId && (placeStartHourId == hourId || (+hourId > placeStartHourId ? lastHourId <= placeEndHourId ? true : false : +hourId < placeStartHourId ? lastHourId >= placeStartHourId ? true : false : false))){
                                errorWithClassRoom[id + ""] = id;
                            }
                        });
                    });
                });
                const placeId = Date.now() + "";
                lesson.places[placeId] = {placeId, dayId, hourId, errorWithClassRoom, possibleWorkTimes, not_availableWorkTimes};
                await TableModel.updateTable({id: tableId, userId: uid}, {lessons});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteLessonFromPlaces = async (uid, req, res, next)=>{
        try{   
            const { lessonId, tableId, placeId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            
            if(table){
                const lessons = JSON.parse(table.dataValues.lessons);
                const classRooms = JSON.parse(table.dataValues.classRooms);
                const lesson = lessons[lessonId + ""];
                if(!lesson){
                    return res.json({errorMessage: "wrong lesson id"});
                }
                Object.keys(classRooms).forEach((id) => {
                    classRooms[id].lessonsCount -= 1 * +lesson.lessonsLength;
                });
                delete lesson.places[placeId + ""];

                await TableModel.updateTable({id: tableId, userId: uid}, {lessons, classRooms});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
    static deleteLesson = async (uid, req, res, next)=>{
        try{   
            const { lessonId, tableId } = req.body;
            const table = await TableModel.getTableById(tableId, uid);
            
            if(table){
                const tableParsed = {teachers: JSON.parse(table.dataValues.teachers), classes: JSON.parse(table.dataValues.classes), lessons: JSON.parse(table.dataValues.lessons), subjects: JSON.parse(table.dataValues.subjects), classRooms: JSON.parse(table.dataValues.classRooms)};
                const {teachers, classes, lessons, subjects, classRooms} = tableParsed;
                const lesson = lessons[lessonId + ""];
                if(!lesson){
                    return res.json({errorMessage: "wrong lesson id"});
                }
                delete subjects[lesson.subjectId + ""].lessons[lessonId + ""];
                subjects[lesson.subjectId + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;

                Object.keys(lesson.teachersId).forEach((evt)=>{
                    delete teachers[evt + ""].lessons[lessonId + ""];
                    teachers[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                });

                Object.keys(lesson.classesId).forEach((evt)=>{
                    delete classes[evt + ""].lessons[lessonId + ""];
                    classes[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                    classes[evt + ""].chapters[lesson.classesId[evt + ""].chapterId][lesson.classesId[evt + ""].groupId].groupWholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                });

                Object.keys(lesson.classRoomsId).forEach((evt)=> {
                    delete classRooms[evt + ""].lessons[lessonId + ""];
                    classRooms[evt + ""].wholeLessonsCount -= +lesson.lessonsCount * +lesson.lessonsLength;
                    classRooms[evt + ""].lessonsCount -= Object.keys(lesson.places).length * +lesson.lessonsLength;
                });

                delete lessons[lessonId + ""];
                await TableModel.updateTable({id: tableId, userId: uid}, {lessons, subjects, teachers, classes, classRooms});
                const newTable = await TableModel.getTableById(tableId, uid);
                return res.json({table: newTable});
            }
            return res.json({errorMessage: "wrong table id"});
        }catch(err){
            return next(err);
        }
    }
}

module.exports = LessonsController;