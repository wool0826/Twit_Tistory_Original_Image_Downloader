var activated = false;
var created = false;

function createTistoryMenu() {
    if (created == false) {
        chrome.contextMenus.create({
            title: "Download Original Image[tistory]",
            contexts: ["image"],
            id: "tistory"
        });
        created = true;

        //console.log("Tistory Menu Created.");
    }
}

function removeTistoryMenu() {
    if (created == true) {
        chrome.contextMenus.remove("tistory");
        created = false;
        //console.log("Tistory Menu Removed.");
    }
}

function checkTistory() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (activated) {
            if (!tabs[0].url.includes("chrome://")) {
                chrome.tabs.sendMessage(tabs[0].id, "exist", function (response) {
                    if (response == "yes") {
                        chrome.tabs.sendMessage(tabs[0].id, tabs[0].url , function (response) {
                            if (response == true) {
                                createTistoryMenu();
                            } else {
                                removeTistoryMenu();
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
                                    createTistoryMenu();
                                } else {
                                    removeTistoryMenu();
                                }
                            });
                        });
                    }
                });
            }
        }
    });
}

function checkInstagram(){
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, "exist", function (response) {
			if (response == "yes") {
				//console.log("responsed.");
				chrome.tabs.sendMessage(tabs[0].id, "insta" , function (response) {
					chrome.downloads.download({
						url: response
                    });
				});
			}
			else {
				chrome.tabs.executeScript(tabs[0].id, { file: "injection.js" }, function () {
					//console.log("injection.");
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						throw Error("Unable to inject script into tab" + tabs[0].id);
					}
					chrome.tabs.sendMessage(tabs[0].id, "insta" , function (response) {
						chrome.downloads.download({
							url: response
                        });               
					});
				});
			}
		});		
	});
}

chrome.contextMenus.create({
    title: "Download Original Image[twitter]",
    contexts: ["image"],
    documentUrlPatterns: ["https://twitter.com/*"],
    id: "twitter"
});

chrome.contextMenus.create({
	title: "Download Original Image[instagram]",
    contexts: ["all"],
    documentUrlPatterns: ["https://www.instagram.com/*"],
    id: "instagram"
});

chrome.contextMenus.onClicked.addListener(function onClick(info, tab) {
    if (info.menuItemId == "twitter") {
        var srcLink = info.srcUrl;
        var dest = srcLink + ":orig";
        var name = srcLink.substring(srcLink.lastIndexOf("/") + 1, srcLink.length);

        chrome.downloads.download({
            url: dest,
            filename: name,
        });
    }
    else if (info.menuItemId == "tistory") {

        var srcLink = info.srcUrl;
		// for version 2.1
        //var preUrl = srcLink.substring(0, srcLink.indexOf("/", 8));
        //var postUrl = srcLink.substring(srcLink.lastIndexOf("/"), srcLink.length);
        var dest = srcLink + "?original";
        
        chrome.downloads.download({
            url: dest
        });
    }
	else if(info.menuItemId == "instagram"){
		checkInstagram();
	}
});

chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
    if (!activated) {
        chrome.browserAction.setIcon({
            path: {
                64: "./on.png"
            }
        });
        checkTistory();

    } else {
        chrome.browserAction.setIcon({
            path: {
                64: "./off.png"
            }
        });
        removeTistoryMenu();
    }	
	activated = !activated;
	
});

chrome.tabs.onActiveChanged.addListener(function callback(tabId, selectInfo) {
    //console.log("onActiveChanged");
    checkTistory();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        //console.log("onUpdated " + tab.url);
        if (tab.url.includes("twitter.com") || tab.url.includes("instagram.com") ) {
            removeTistoryMenu();
        } else {
            checkTistory();
        }
    }
});



