const weekDays = require("./defaultValues.js");
const {generateFewHours, generateHours, updateHoursName} = require("./generateHoursInfo.js");

function generateWeekDaysWithHours({weekDaysName=weekDays, weekDaysCount=5}){
    const hours = generateHours({});
    const weekDaysObj = {};

    for(let i = 1; i <= weekDaysCount; i++){
        weekDaysObj[i + ""] = {
            ...weekDaysName[i + ""],
            hours
        };
    }
    return weekDaysObj;
}
function updateWeekDays({weekDaysName=weekDays, oldWeekDays, newWeekDaysCount, oldWeekDaysCount, lessons}){
    let weekDaysObj = {};
    let weekKeys = Object.keys(oldWeekDays);

    if(+newWeekDaysCount < +oldWeekDaysCount){
        for(const dayKey of weekKeys){
            if(+dayKey <= +newWeekDaysCount){
                weekDaysObj[dayKey + ""] = {...oldWeekDays[dayKey + ""]};
                continue;
            }
            Object.values(lessons).forEach((lesson)=>{
                Object.values(lesson.places).forEach((place)=>{
                    if(place.dayId == dayKey){
                        delete lessons[lesson.lessonId + ""].places[place.placeId + ""];
                    }
                });
            });
        }
        return weekDaysObj;
    }

    if(+newWeekDaysCount <= 7){
        const hours = oldWeekDays["1"].hours;
        Object.keys(hours).forEach((evt)=>{
            hours[evt + ""].available = {...hours[evt + ""].available, ...hours[evt + ""].possible, ...hours[evt + ""].not_available};
            hours[evt + ""].possible = {};
            hours[evt + ""].not_available = {};
        });
        weekDaysObj = {...oldWeekDays};

        for(let i = weekKeys.length + 1; i <= newWeekDaysCount; i++){
            weekDaysObj[i + ""] = {
                ...weekDaysName[i + ""],
                hours
            };
        }
        return weekDaysObj;
    }
    return oldWeekDays;
}
function updateWeekDayName({oldWeekDays, dayId, newDayName="", newShortName=""}){
    oldWeekDays[dayId + ""] = {...oldWeekDays[dayId + ""], name: newDayName, shortName: newShortName};
    return oldWeekDays;
}
function updateWeekDayHours({oldHoursCount, newHoursCount, weekDays, lessons}){
    const weekDaysObj = {};
    let weekKeys = Object.keys(weekDays);

    if(oldHoursCount > newHoursCount){
        for(const dayKey of weekKeys){
            weekDaysObj[dayKey] = {...weekDays[dayKey], hours: generateFewHours({lengthHours: newHoursCount, weekDaysHours: weekDays[dayKey].hours, lessons})};
        }
        return weekDaysObj;
    }
    if(oldHoursCount < newHoursCount){
        for(const dayKey of weekKeys){
            weekDaysObj[dayKey] = {...weekDays[dayKey], hours: generateHours({lengthHours: newHoursCount, initalHour: weekDays[dayKey].hours})};
        }
        return weekDaysObj;
    }
    
    return weekDays;
}
function updateWeekDayHoursInfo(data){
    const weekDays = data.oldWeekDays;
    const daysKeys = Object.keys(weekDays);
    
    for(const dayKey of daysKeys){
        weekDays[dayKey + ""] = {...weekDays[dayKey + ""], hours: updateHoursName({...data, oldHours: weekDays[dayKey + ""].hours})};
    }
    return weekDays;
}

module.exports = {generateWeekDaysWithHours, updateWeekDays, updateWeekDayName, updateWeekDayHours, updateWeekDayHoursInfo};