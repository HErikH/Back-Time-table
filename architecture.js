const mainObject = {
    id: 1,
    userId: 174687189784,
    name: "example",
    year: "2023/2024",
    weekDaysCount: 5,
    daysHours: 7,
    weekDays: {
        "1": {
            dayId: 1,
            name: "Monday",
            shortName: "Mo",
            hours: {
                "1985": {
                    breakId: 1985,
                    type: "break",
                    name: "arajin dasamijoc",
                    shortName: "1",
                    timeStart: "08:00",
                    timeEnd: "08:15",
                },
                "1": {
                    hourId: 1,
                    type: "hour",
                    name: "arajin das",
                    shortName: "1",
                    timeStart: "08:15",
                    timeEnd: "08:55",
                    available: {},
                    possible: {},
                    not_available: {}
                }
            }
        },
        "2":{
            dayId: 2,
            name: "Tuesday",
            shortName: "Tu",
            hours: {
                "1985": {
                    breakId: 1985,
                    type: "break",
                    name: "arajin dasamijoc",
                    shortName: "1",
                    timeStart: "08:00",
                    timeEnd: "08:15",
                },
                "1": {
                    hourId: 1,
                    type: "hour",
                    name: "arajin das",
                    shortName: "1",
                    timeStart: "08:15",
                    timeEnd: "08:55",
                    available: {},
                    possible: {},
                    not_available: {}
                }
            }
        },
        "3": {
            dayId: 3,
            name: "Wednesday",
            shortName: "We",
            hours: {
                "1985": {
                    breakId: 1985,
                    type: "break",
                    name: "arajin dasamijoc",
                    shortName: "1",
                    timeStart: "08:00",
                    timeEnd: "08:15",
                },
                "1": {
                    hourId: 1,
                    type: "hour",
                    name: "arajin das",
                    shortName: "1",
                    timeStart: "08:15",
                    timeEnd: "08:55",
                    available: {},
                    possible: {},
                    not_available: {}
                }
            }
        },
        "4": {
            dayId: 4,
            name: "Thursday",
            shortName: "Th",
            hours: {
                "1985": {
                    breakId: 1985,
                    type: "break",
                    name: "arajin dasamijoc",
                    shortName: "1",
                    timeStart: "08:00",
                    timeEnd: "08:15",
                },
                "1": {
                    hourId: 1,
                    type: "hour",
                    name: "arajin das",
                    shortName: "1",
                    timeStart: "08:15",
                    timeEnd: "08:55",
                    available: {},
                    possible: {},
                    not_available: {}
                }
            }
        },
        "5": {
            dayId: 5,
            name: "Friday",
            shortName: "Fr",
            hours: {
                "1985": {
                    breakId: 1985,
                    type: "break",
                    name: "arajin dasamijoc",
                    shortName: "1",
                    timeStart: "08:00",
                    timeEnd: "08:15",
                },
                "1": {
                    hourId: 1,
                    type: "hour",
                    name: "arajin das",
                    shortName: "1",
                    timeStart: "08:15",
                    timeEnd: "08:55",
                    available: {},
                    possible: {},
                    not_available: {}
                }
            }
        }
    },
    subjects: {
        "1" : {
            subjectId: 1,
            longName: "hayoc lezu",
            shortName: "hy",
            color: "rgba(15, 24, 156)",
            wholeLessonsCount: 4,
            classRoomsId: {},
            lessons: {"1": 1}
        }
    },
    classes: {
        "1" : {
            classId: 1,
            longName: "arajin dasaran",
            shortName: "1",
            color: "rgba(15, 24, 156)",
            wholeLessonsCount: 4,
            classSupervisors: {"1": 1},
            chapters: {
                "all": {
                    "all": {
                        groupName: "all class",
                        groupWholeLessonsCount: 4,
                        groupMembersCount: 0
                    }
                },
                "1574187541578": {
                    "895487": {
                        groupName: "txaner",
                        groupWholeLessonsCount: 0,
                        groupMembersCount: 0
                    },
                    "91674887": {
                        groupName: "axchikner",
                        groupWholeLessonsCount: 0,
                        groupMembersCount: 0
                    }
                }
            },
            lessons: {"1": 1}
        }
    },
    classRooms: {
        "1" : {
            classRoomId: 1,
            longName: "Number 1",
            shortName: "N1",
            color: "rgba(15, 24, 156)",
            wholeLessonsCount: 4,
            lessonsCount: 0,
            lessons: {"1": 1}
        }
    },
    teachers: {
        "1" : {
            teacherId: 1,
            name: "Elen",
            lastName: "Mesropyan",
            shortName: "ME",
            email: "",
            phone: "",
            gender: "female",
            color: "rgba(15, 24, 156)",
            wholeLessonsCount: 4,
            classRoomsId: {},
            classIdWhoesSupervisor: {"1": 1},
            lessons: {"1": 1}
        }
    },
    lessons: {
        "1": {
            lessonId: 1,
            subjectId: 1,
            teachersId: {"1":1},
            classesId: {
                "1":{
                    chapterId: "all",
                    groupId: "all"
                }
            },
            classRoomsId: {"1":1, "2": 2},
            lessonsCount: 4,
            lessonsLength: 1,
            places:{
                "878488":{
                    placeId: "878488",
                    dayId: 1,
                    hourId: 1,
                    errorWithClassRoom: {"2": 2},
                    possibleWorkTimes: {
                        subjectId: "1",
                        teachersId: {}, 
                        classesId: {},
                        classRoomsId: {}
                    },
                    not_availableWorkTimes: {
                        subjectId: "1",
                        teachersId: {}, 
                        classesId: {},
                        classRoomsId: {}
                    }
                },
                "9787148":{
                    placeId: "9787148",
                    dayId: 2,
                    hourId: 1,
                    errorWithClassRoom: {},
                    possibleWorkTimes: {},
                    not_availableWorkTimes: {}
                },
            }
        }
    }
}

const workTimes= {
    "1": {
        "1": "possible",
        "2": "not_available"
    }
}

const test = firstHourId >= startHourId ? lastHourId <= endHourId ? true : false : firstHourId <= startHourId ? lastHourId >= startHourId ? true : false : false;