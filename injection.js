chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == 'insta') {
        var imagePanel = document.getElementsByClassName("FFVAD");
        var hasNextImage = (document.getElementsByClassName("    coreSpriteRightChevron")[0] == undefined);
        
        sendResponse(
            hasNextImage
            ? imagePanel[imagePanel.length - 1].src
            : imagePanel[imagePanel.length - 2].src
        );
    } else if (request.type == 'tistory') {
        var script = document.getElementsByTagName("script");

        for (var i = 0; i < script.length; i++) {
            if (script[i].innerHTML.includes("T.config") || script[i].innerHTML.includes("tistory")) {
                sendResponse(true);
                return;
            }
        }

        sendResponse(false);
    } else {
        sendResponse(null);
    }
});