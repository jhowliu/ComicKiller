$.get(location.origin + location.pathname, function(res) {
	var target, targetURL, host;
	target = res.match(/\/Utility\/.*\/.*\.js/)[0];
	targetURL = location.origin + target;
	
	$.get(targetURL, function(res) {
		var something, mapping = {}, preVolURL = "", nextVolURL = "";
		content = res.replace(/var/g, "").replace(/ /g, "").replace(/"/g, "");
		something = content.split(';');

		for(var index in something) {
			something[index].replace("\"", "");
			mapping[something[index].split("=")[0]] = something[index].split("=")[1];
		}
		
		if (mapping.preVolume.match(/alert/) == null) 
			preVolURL = location.origin + mapping.preVolume;

		if (mapping.nextVolume.match(/alert/) == null) 
			nextVolURL = location.origin + mapping.nextVolume;

		var tmp, imgURL = new Array(mapping.picCount);

		mapping.hosts = mapping.hosts.replace(/[\]\[]/g, "");
		host = (mapping.hosts).split(",");

		for (var index = 0; index != mapping.picCount; index++) {
			tmp = "picAy[" + index + "]";
			imgURL[index] = host[0] + mapping[tmp];
		}
		console.log(imgURL);
		console.log(preVolURL);
		console.log(nextVolURL);
		console.log(mapping);
	});
});


