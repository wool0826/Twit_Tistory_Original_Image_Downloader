chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == 'insta') {
        const imagePanel = document.getElementsByClassName("FFVAD");
        const hasNextImage = (document.getElementsByClassName("    coreSpriteRightChevron")[0] == undefined);
        
        sendResponse(
            hasNextImage
            ? imagePanel[imagePanel.length - 1].src
            : imagePanel[imagePanel.length - 2].src
        );
    } else if (request.type == 'tistory') {
        const script = document.getElementsByTagName("script");

        for (var i = 0; i < script.length; i++) {
            if (script[i].innerHTML.includes("T.config") || script[i].innerHTML.includes("tistory")) {
                sendResponse(true);
                return;
            }
        }

        sendResponse(false);
    } else if (request.type == 'tweetdeck') {
        const link = document.getElementsByClassName("js-media-image-link");
        var targetImageList = new Set();

        for (var i = 0; i < link.length; i++) {
            if (link[i].href == request.link) {
                const imageUrl = link[i].style.backgroundImage; // scheme: url("${imageUrl}")
                targetImageList.add(imageUrl.split("\"")[1]);
            }
        }
        sendResponse(Array.from(targetImageList));
    } else {
        sendResponse(null);
    }
});