listenUpdateEvent = function(req, sender, res) {
    var i, ele, isNew = true, counter = 0, data;
    console.log(req.action);
    if (req.action != "updateCurrentVol") return;
    console.log("onMessage");
    data = JSON.parse(localStorage.userList);
    console.log(data);
    for (i = 0; i != data.length; i++) {
        ele = data[i]; 
        if (ele.title == req.obj.title && ele.site == req.obj.site) {
            ele.currentVol = req.obj.currentVol;
            ele.currentVolURL = req.obj.currentVolURL;
            isNew = false;
        }
    }
    console.log("IsNew? " + isNew);
    if (isNew) 
        data.push(req.obj);
    checkUpdate8comic(req.obj);
    console.log(data);
    localStorage.userList = JSON.stringify(data);
    return res({
        response : "Update currentVol succesfully." 
    });
};

chrome.extension.onMessage.addListener(listenUpdateEvent)

// Create a alarm to update every 30 mins.
setTimeToCheckUpdate = function(min) {
    console.log("ComicKiller will update your comic history every 30 miniutes.");
    return chrome.alarms.create('Update', {
        periodInMinutes: min 
    });
};

TimeToCheckUpdate = function(alarm) {
    var data, i;
    if (alarm != null && alarm.name === 'Update') {
        console.log("It's time to update."); 
        data = JSON.parse(localStorage.userList);
        for (i = 0; i != data.length; i++) {
            console.log(data[i]);
            checkUpdate8comic(data[i]);
        }
    }
};

// Listen the onAlarm event.
chrome.alarms.onAlarm.addListener(TimeToCheckUpdate);

// Check if it has the newest vol.
checkUpdate8comic = function(obj) {
    var data, targetVolURL, targetVol, target;
    $.get(obj.lastVolURL, function(res) {
        start = res.search("<title>");
        end = res.search("</title>");
        target = res.substring(start+7, end);
        targetVol = target.match(/-[ ]*([0-9]+)/)[1];
        targetVolURL = obj.lastVolURL.replace(/[0-9]+$/, targetVol);
        if (parseInt(obj.lastVol) < parseInt(targetVol)) {
            // Find the newest vol. 
            obj.lastVol = targetVol;
            obj.lastVolURL = targetVolURL;
            updateLastVolEvent(obj);
            alert("[" + obj.title + "]" + "最新一話已經更新囉(" + targetVol + "話)");
        }
    });
};

checkUpdateDm5 = function(obj) {

};

Init = function() {
    console.log("Initial");
    if (!localStorage.length)
        localStorage.userList = JSON.stringify(localStorage.userList || []);
    setTimeToCheckUpdate(30);
}

// Initialize localStorage
Init();
