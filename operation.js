var toggle = false;
var created = false;

function createMenu() {
    if (created == false) {
        chrome.contextMenus.create({
            title: "Download Original Image[tistory]",
            contexts: ["image"],
            id: "tistory"
        });
        created = true;

        console.log("create!");
    }
}

function removeMenu() {
    if (created == true) {
        chrome.contextMenus.remove("tistory");
        created = false;
        console.log("remove!");
    }
}

function isTistory() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //console.log(tabs[0].url);
        //console.log("isTistory Toggle:", toggle);

        if (toggle == true) {
            if (!tabs[0].url.includes("chrome://")) {
                chrome.tabs.sendMessage(tabs[0].id, "exist?", function (response) {
                    if (response == "yes") {
                        chrome.tabs.sendMessage(tabs[0].id, tabs[0].url , function (response) {
                            if (response == true) {
                                createMenu();
                            } else {
                                removeMenu();
                            }
                        });
                    }
                    else {
                        chrome.tabs.executeScript(tabs[0].id, { file: "injection.js" }, function () {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                throw Error("Unable to inject script into tab" + tabs[0].id);
                            }
                            chrome.tabs.sendMessage(tabs[0].id, tabs[0].url , function (response) {
                                if (response == true) {
                                    createMenu();
                                } else {
                                    removeMenu();
                                }
                            });
                        });
                    }
                });
            }
        }
    });
}

chrome.contextMenus.create({
    title: "Download Original Image[twitter]",
    contexts: ["image"],
    documentUrlPatterns: ["https://twitter.com/*"],
    id: "twitter"
});

chrome.contextMenus.onClicked.addListener(function onClick(info, tab) {
    if (info.menuItemId == "twitter") {
        //console.log(JSON.stringify(info));

        var srcLink = info.srcUrl;
        var dest = srcLink + ":orig";
        var name = srcLink.substring(srcLink.lastIndexOf("/") + 1, srcLink.length);

        chrome.downloads.download({
            url: dest,
            filename: name
        });
    }
    else if (info.menuItemId == "tistory") {

		var post = info.srcUrl.substring(info.srcUrl.lastIndexOf("=")+1,info.srcUrl.length);
		
		post = decodeURIComponent(post);
		
		var preUrl = post.substring(0, post.indexOf("/", 8));
        var postUrl = post.substring(post.lastIndexOf("/"), post.length);
		var dest = preUrl + "/original" + postUrl;
		
        chrome.downloads.download({
            url: dest
        });
    }
});

chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
    if (toggle == false) {
        chrome.browserAction.setIcon({
            path: {
                64: "icon.png"
            }
        });

        toggle = true;
        console.log("onClicked", toggle);
        isTistory();

    } else {
        chrome.browserAction.setIcon({
            path: {
                64: "icon-off.png"
            }
        });


        toggle = false;
        removeMenu();

        console.log("onClicked", toggle);
    }
});

chrome.tabs.onActiveChanged.addListener(function callback(tabId, selectInfo) {
    console.log("onActiveChanged");
    isTistory();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        console.log("onUpdated", tab.url);
        if (tab.url.includes("twitter.com")) {
            removeMenu();
        } else {
            isTistory();
        }
    }
});



