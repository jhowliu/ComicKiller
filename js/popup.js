var userList;
loadComicList = function(data) {
    var i;
    for (i = 0; i != data.length; i++) { 
        info = '<div class="info"><div class="currentVol' + i + '"><h4>Current Episode : "'  + data[i].currentVol + '"</h4></div><div class="lastVol' + i + '"><h4>Newest Episod : "' + data[i].lastVol + '"</h4></div></div>'
        // Set cover image.
        switch(data[i].site) {
            case '8comic':
                $('#eightComic').append('<div><h3>' + data[i].title + '</h3><li><img src="' + data[i].coverImgURL + '"></img>' + info + '</li></div>');
                break;
            case 'dm5':
                $('#dm5').append('<div><h3>' + data[i].title + '</h3><li><img src="' + data[i].coverImgURL + '"></img>' + info + '</li></div>');
                break;
        }
    }
};

Init = function() {
    userList = JSON.parse(localStorage.userList);
    loadComicList(userList);
};

window.addEventListener('click', function() {
    for (i = 0; i != userList.length; i++) {
        selectCur = '.' + 'currentVol' + i;
        selectLast = '.' + 'lastVol' + i;
        $(selectCur).bind('click', { param1 : userList[i].currentVolURL}, function(event) {
            return chrome.tabs.create({
                url: event.data.param1
            });
        });
        $(selectLast).bind('click', { param1 : userList[i].lastVolURL}, function(event) {
            return chrome.tabs.create({
                url: event.data.param1
            });
        });

    }
});

$(function() {
    return Init();
});
