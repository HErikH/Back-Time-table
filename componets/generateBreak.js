function addBreakInHours({weekDays, beforeHourId, name, shortName, timeStart, timeEnd}){
    const weekObj = {};
    Object.values(weekDays).forEach((evt) => {
        const breakId = Date.now() + "";
        evt.hours[breakId + ""] = {
            breakId,
            beforeHourId,
            type: "break",
            name, 
            shortName,
            timeStart,
            timeEnd
        };
        weekObj[evt.dayId + ""] = {...evt};
    });

    return weekObj;
}
function updateBreakInfo({weekDays, breakId, newBeforeHourId, newName, newShortName, newTimeStart, newTimeEnd}){
    const weekObj = {};
    Object.values(weekDays).forEach((evt) => {
        if(!evt.hours[breakId + ""]){
            throw {message: "wrong break id, not found break for this break id"};
        }
        const obj = {};
        if(newBeforeHourId !== null && newBeforeHourId !== undefined) obj.beforeHourId = newBeforeHourId;
        if(newName !== null && newName !== undefined) obj.name = newName;
        if(newShortName !== null && newShortName !== undefined) obj.shortName = newShortName;
        if(newTimeStart !== null && newTimeStart !== undefined) obj.timeStart = newTimeStart;
        if(newTimeEnd !== null && newTimeEnd !== undefined) obj.timeEnd = newTimeEnd;
        evt.hours[breakId + ""] = {...evt.hours[breakId + ""], ...obj};
        weekObj[evt.dayId + ""] = {...evt};
    });

    return weekObj;
}
function deleteBreakFromHours({weekDays, breakId}){
    const weekObj = {};
    Object.values(weekDays).forEach((evt) => {
        if(!evt.hours[breakId + ""]){
            throw {message: "wrong break id, not found break for this break id"};
        }
        delete evt.hours[breakId + ""];
        weekObj[evt.dayId + ""] = {...evt};
    });

    return weekObj;
}

module.exports = { addBreakInHours, deleteBreakFromHours, updateBreakInfo };