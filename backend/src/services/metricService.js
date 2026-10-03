//for getting formatted dates

function getFormattedDate(date= new Date()){
    return date.toISOString().split('T')[0];
}

function getYesterdayFormatted(){
    const yesterday= new Date();
    yesterday.setDate(yesterday.getDate()-1);
    return yesterday.toISOString().split('T')[0];
}


//calculate updated streaks based on activity date logs 

function calculateUpdatedStreak(dateHistory,actionType){
    const today=getFormattedDate();
    const yesterday=getYesterdayFormatted();


    if(dateHistory.includes(today)){
        return null; //no streak change needed today
    }

    if(dateHistory.includes(yesterday)){
        return true;  //increment streak
    }

    //if no action was performed yesterday and history is not empty , streak broke
    if(dateHistory.length>0 && !dateHistory.includes(yesterday)){
        return false;  //reset streak to 1
    }

    return true; // first time activity initialization
}

module.exports ={
    getFormattedDate,
    calculateUpdatedStreak
};

