var firstPage = location.origin + location.pathname + location.search;
var listener = new Object();
var calPictureURL = function (cs, ch, host, callback) {
		var pagenum, patten, ans, c;
		host = host + '/' + ch;
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
		var picAy = new Array(pagenum);
		for(var p = 1; p <= pagenum; p++) {
			ans = (parseInt((p - 1) / 10) % 10) + (((p - 1) % 10) * 3);
			patten = c.substring(ans + 10, ans + 13);
			var tmpURL = host + "/" + (p < 10 ? "00" + p : p < 100 ? "0" + p : p) + "_" + patten + ".jpg";
			picAy[p-1] = tmpURL;
		}

		callback(picAy);
}

var processing = function (callback) {
	$.get(firstPage, function(res) {
		var preVolURL, nextVolURL, picCount, something, mapping = {}, thePic, startSymbol, host, ch;
		thePic = $('#TheImg')[0].src;
		startSymbol = thePic.match(/[0-9]*_([a-z0-9]*).jpg$/);
		ch = location.search.match(/[0-9]+$/);
		host = thePic.replace(startSymbol[0], "").replace(/\/[0-9]+\/$/, "");
		preVolURL = location.origin + location.pathname + "?ch=" + $('#prevname')[0].innerText.replace(/[ \[\]]/g, "");
		nextVolURL = location.origin + location.pathname + "?ch=" + $('#nextname')[0].innerText.replace(/[ \[\]]/g, "");
		something = $('#Form1 > script').text().replace(/var/g, "").replace(/[ \']/g, "").replace(/eval.*/, "");
		something = something.split(";");
		
		for (var index in something) 
			mapping[something[index].split("=")[0]] = something[index].split("=")[1];
		
		var picAy, patten, ans, c;

		calPictureURL(mapping.cs, ch, host, function(pics) {
			picAy = pics;
		});
		
		callback(ch, picAy, nextVolURL, host);
	});
};

processing(function(ch, pic, nextVolURL, host){
	$('html').html('<!DOCTYPE HTML><head></head><title></title></head><body></body>');

	for (var i = 0; i != pic.length; i++)
		$('body').append("<div><img src='" + pic[i] + "'></div>");

	window.addEventListener('scroll', function() { 
		console.log(window.innerHeight + 1 + $(window).scrollTop());
		$(window).scroll(function() {
   			if(window.innerHeight + $(window).scrollTop() + 1 == $(document).height()) {
    	   		 alert("bottom!");
    	   		 loadNext(nextVolURL, host, ch, function(nextURL, nextCh, pics) {
    	   		 	 nextVolURL = nextURL;
    	   		 	 ch = nextCh;
    	   		 	 for (var i = 0; i != pics.length; i++) 
    	   		 	 	 $('body').append("<div><img src='" + pics[i] + "'></div>");
    	   		 });
   			}
   		}); 
	},
	false);
});

var loadNext = function(nextVolURL, host, ch, callback) {
	$.get(nextVolURL, function(data) {
		var picAy, something, mapping = {}, target, pagenum, curHost;
		ch++;
		curHost += ch + "/";
		nextVolURL = nextVolURL.replace(nextVolURL.match(/=([0-9]+)/)[1], ch);
		console.log(nextVolURL);
		target = data.search("var chs");
		data = data.substring(target, data.length);
		target = data.search("</script>");
		data = data.substring(0, target).replace(/var/g, "").replace(/[ \']/g, "").replace(/eval.*/, "");
		something = data.split(";");
		
		for (var index in something) 
			mapping[something[index].split("=")[0]] = something[index].split("=")[1];
		
		calPictureURL(mapping.cs, ch, host, function(pics) {
			callback(nextVolURL, ch, pics);
		});


	}); 
}