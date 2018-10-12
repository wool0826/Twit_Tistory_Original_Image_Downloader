chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request == "exist") { sendResponse("yes"); return; }
	else if(request == "insta"){
        var d = document.getElementsByClassName("FFVAD");
        var b = document.getElementsByClassName("    coreSpriteRightChevron");
        
        if(b[0] == undefined){
            sendResponse(d[d.length-1].src)
        } else {
            sendResponse(d[d.length-2].src)
        }
		return;
	} else {
        if (request.includes("tistory.com")) {
            //console.log("This site is tistory. return true.");
            sendResponse(true);
            return;
        }

        var script = document.getElementsByTagName("script");

        for (var i = 0; i < script.length; i++) {
            if (script[i].innerHTML.includes("T.config") || script[i].innerHTML.includes("tistory")) {
                //console.log("This site is tistory. return true.");
                sendResponse(true);
                return;
            }
        }

        //console.log("This site is not tistory. return false.");
        sendResponse(false);
    }
});