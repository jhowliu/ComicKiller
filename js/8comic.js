var firstPage = location.origin + location.pathname + location.search;
var nextVolURL, ch, host;
var listener = new Object();
var loading = false;
var user_data;

var updateEvent = function(obj) {
    chrome.extension.sendMessage({
        action: "updateCurrentVol",
        obj: obj
    }, function (res) {
        console.log(res);    
    });
}

var calPictureURL = function (cs, callback) {
    var pagenum, patten, ans, c, curHost;
    curHost = host + '/' + ch;
    c = "";

    for (var index = 0; index <= cs.length/50; index++) {
        if ((cs.substring(index * 50, index * 50 + 4)).replace(/[a-z]*/g, "") ==  ch) {
            c = cs.substring(index * 50, index * 50 + 50);
            break;
        }
    }

    if (c == "") 
        c = (cs.substring(cs.length - 50, cs.length)).replace(/[a-z]*/g, "");

    console.log(c);
    pagenum = c.substring(7, 10).replace(/[a-z]*/gi, "");
    curHost = curHost.replace(/[0-9]+/, c.substring(4, 6).replace(/[a-z]*/g, "")).replace(/\/[0-9]+\//, "/" + c.substring(6, 7).replace(/[a-z]*/g, "") + "/");

    var picAy = new Array(pagenum);
    for(var p = 1; p <= pagenum; p++) {
        ans = (parseInt((p - 1) / 10) % 10) + (((p - 1) % 10) * 3);
        patten = c.substring(ans + 10, ans + 13);
        var tmpURL = curHost + "/" + (p < 10 ? "00" + p : p < 100 ? "0" + p : p) + "_" + patten + ".jpg";
        picAy[p-1] = tmpURL;
    }

    callback(picAy);
}

var processing = function (callback) {
    $.get(firstPage, function(res) {
        var preVolURL, picCount, something, mapping = {}, thePic, startSymbol, lastVol, lastVolURL, currentVol, currentVolURL, title, coverImgURL;
        coverImgURL = "http://www.8comic.com/pics/0/" + location.href.match(/([0-9]+).html/)[1] + ".jpg";
        title = $('title')[0].innerText;
        lastVol = title.match(/-[ ]*([0-9]+)/)[1];
        title = title.match(/[^\x00-\x7F]+/)[0];
        thePic = $('#TheImg')[0].src;
        startSymbol = thePic.match(/[0-9]*_([a-z0-9]*).jpg$/);
        ch = location.search.match(/[0-9]+$/)[0];
        currentVol = parseInt(ch);
        host = thePic.replace(startSymbol[0], "").replace(/\/[0-9]+\/$/, "");
        currentVolURL = location.origin + location.pathname + "?ch=" + currentVol;
        lastVolURL = location.origin + location.pathname + "?ch=" + lastVol;
        preVolURL = location.origin + location.pathname + "?ch=" + $('#prevname')[0].innerText.replace(/[ \[\]]/g, "");
        nextVolURL = location.origin + location.pathname + "?ch=" + $('#nextname')[0].innerText.replace(/[ \[\]]/g, "");
        something = $('#Form1 > script').text().replace(/var/g, "").replace(/[ \']/g, "").replace(/eval.*/, "");
        something = something.split(";");
        user_data = {
            lastVol : lastVol,
            lastVolURL : lastVolURL, 
            currentVol : currentVol,
            currentVolURL : currentVolURL,
            coverImgURL: coverImgURL,
            title : title,
            site : '8comic'
        }
        console.log("Update user's comic info.");
        console.log(user_data);
        updateEvent(user_data);   
        for (var index in something) 
            mapping[something[index].split("=")[0]] = something[index].split("=")[1];
		
        var picAy;
		
        calPictureURL(mapping.cs, function(pics) {
            picAy = pics;
        });
        callback(picAy); 
    });
};


var loadNext = function(callback) {
    $.get(nextVolURL, function(data) {
        var picAy, something, mapping = {}, target, pagenum, curHost, nextCh;
        // Update my comic informations.
        ch = parseInt(ch) + 1;
        nextCh = ch + 1; 
        user_data['currentVol'] = ch; 
        user_data['currentVolURL'] = nextVolURL; 
        console.log("Update user's comic info.");
        updateEvent(user_data);   
        nextVolURL = nextVolURL.replace(/[0-9]+$/, nextCh);
        target = data.search("var chs");
        data = data.substring(target, data.length);
        target = data.search("</script>");
        data = data.substring(0, target).replace(/var/g, "").replace(/[ \']/g, "").replace(/eval.*/, "");
        something = data.split(";");
	     
        for (var index in something) 
            mapping[something[index].split("=")[0]] = something[index].split("=")[1];
	
        calPictureURL(mapping.cs, function(pics) {
            callback(pics);
        });
    }); 
}

processing(function(pic) {
    $('html').html('<head><title></title></head><body></body>');
    for (var i = 0; i != pic.length; i++)
       $('body').append("<div class='eox-page'><img src='" + pic[i] + "'></img></div>");
    setTimeout(function() {
        window.addEventListener('scroll', function() { 
            console.log("Window height: " + window.innerHeight + ", ScrollBar height: " + $(window).scrollTop() 
                + ", Document height: " + $(document).height());
            console.log(loading);
            $(window).scroll(function() {
                if(window.innerHeight + $(window).scrollTop() + 5000 >= $(document).height() && !loading && parseInt(ch)+1 <= parseInt(user_data['lastVol'])) {
                    loading = true;
                    console.log("NewURL:" + nextVolURL + ", Current Chapter:" + ch);
                    loadNext(function(pics) {
                        for (var i = 0; i != pics.length; i++)
                        $('body').append("<div class='eox-page'><img src='" + pics[i] + "'></img></div>");
                    setTimeout(function() {
                        loading = false;      
                    }, 1000);
                    });
                }
            }); 
        }, false);
    }, 1000);
});
