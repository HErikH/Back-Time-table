function addWorkTimeInHours({weekDays, id}){
    const weekObj = {};
    const weekDaysKeys = Object.keys(weekDays);
    weekDaysKeys.forEach((evt)=>{
        const hoursObj = {};
        const hoursKeys = Object.keys(weekDays[evt + ""].hours);
        hoursKeys.forEach((e) => hoursObj[e + ""] = {...weekDays[evt + ""].hours[e + ""], available: {...weekDays[evt + ""].hours[e + ""].available, [id + ""]: id}});
        weekObj[evt + ""] = {...weekDays[evt + ""], hours: hoursObj};
    });
    return weekObj;
}
function deleteWorkTimeInHours({weekDays, id}){
    const weekDaysKeys = Object.keys(weekDays);
    weekDaysKeys.forEach((evt)=>{
        const hoursKeys = Object.keys(weekDays[evt + ""].hours);
        hoursKeys.forEach((e) => {
            delete weekDays[evt + ""].hours[e + ""].available[id + ""];
            delete weekDays[evt + ""].hours[e + ""].possible[id + ""];
            delete weekDays[evt + ""].hours[e + ""].not_available[id + ""];
        });
    });
    return weekDays;
}
function updateWorkTimeInHours({weekDays, workTimes, id}){
    Object.keys(workTimes).forEach((evt)=>{
        Object.keys(workTimes[evt + ""]).forEach((e) => {
            if(!weekDays[evt + ""]){
                throw {message: "wrong weekDay id"};
            };
            if(!weekDays[evt + ""].hours[e + ""]){
                throw {message: "wrong hour id"};
            }
            const time = workTimes[evt + ""][e + ""];
            if(time === "available"){
                delete weekDays[evt + ""].hours[e + ""].possible[id + ""];
                delete weekDays[evt + ""].hours[e + ""].not_available[id + ""];
                weekDays[evt + ""].hours[e + ""][time] = {...weekDays[evt + ""].hours[e + ""][time], [id + ""]: id};
                return;
            }
            if(time === "possible"){
                delete weekDays[evt + ""].hours[e + ""].available[id + ""];
                delete weekDays[evt + ""].hours[e + ""].not_available[id + ""];
                weekDays[evt + ""].hours[e + ""][time] = {...weekDays[evt + ""].hours[e + ""][time], [id + ""]: id};
                return;
            }
            if(time === "not_available"){
                delete weekDays[evt + ""].hours[e + ""].available[id + ""];
                delete weekDays[evt + ""].hours[e + ""].possible[id + ""];
                weekDays[evt + ""].hours[e + ""][time] = {...weekDays[evt + ""].hours[e + ""][time], [id + ""]: id};
                return;
            }
            throw {message: "don't right passed for hour id '" + e + "' option text"};
        })
    })
    return weekDays;
}
function checkWorkTime({weekDays, id, dayId, hourId, lessonLength}){
    const state = {
        possible: {},
        not_available: {}
    };
    const hoursArr = [hourId];
    for(let i = (+hourId + 1); i <= lessonLength; i++){
        hoursArr.push(i + "");
    };

    hoursArr.forEach((evt)=>{
        if(weekDays[dayId + ""].hours[evt].possible[id]){
            state.possible[id + ""] = id;
        }
        if(weekDays[dayId + ""].hours[evt].not_available[id]){
            state.not_available[id + ""] = id;
        }
    });

    return state;
}

module.exports = {addWorkTimeInHours, deleteWorkTimeInHours, updateWorkTimeInHours, checkWorkTime};