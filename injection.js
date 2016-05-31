chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request == "exist?") { sendResponse("yes"); return; }
    else {
        if (request.includes("tistory.com")) {
            console.log("url tistory.");
            sendResponse(true);
            return;
        }

        var script = document.getElementsByTagName("script");

        for (var i = 0; i < script.length; i++) {
            if (script[i].innerHTML.includes("T.config") || script[i].innerHTML.includes("tistory")) {
                console.log("includes... -> return true");
                sendResponse(true);
                return;
            }
        }

        console.log("not includes... -> return false");
        sendResponse(false);
    }
});