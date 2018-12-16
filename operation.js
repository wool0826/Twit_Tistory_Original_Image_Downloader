var activated = false;
var created = false;

var tiTitle = "Download Original Image[tistory]";
var inTitle = "Download Original Image[instagram]";
var twTitle = "Download Original Image[twitter]";
var dmTitle = "Download Original Image[daum]";

var hotkey = "None";

chrome.storage.local.get({
    hotkeyOption: "None"
}, function(items){    
    hotkey = items.hotkeyOption;
    console.log("First Generated hotkey:" + hotkey);

    chrome.contextMenus.create({
        title: (hotkey!="None" ? hotkey + ") " + twTitle : twTitle),
        contexts: ["image"],
        documentUrlPatterns: ["https://twitter.com/*"],
        id: "twitter"
    });

    chrome.contextMenus.create({
        title: (hotkey!="None" ? hotkey + ") " + dmTitle : dmTitle),
        contexts: ["image"],
        documentUrlPatterns: ["https://*.daum.net/*","http://*.daum.net/*"],
        id: "daum"
    });

    chrome.contextMenus.create({
        title: (hotkey!="None" ? hotkey + ") " + inTitle : inTitle),
        contexts: ["page"],
        documentUrlPatterns: ["https://www.instagram.com/*"],
        id: "instagram"
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace){
    chrome.storage.local.get({
        hotkeyOption: "None"
    }, function(items){
        hotkey = items.hotkeyOption;
        console.log("Changed hotkey: " + hotkey);

        chrome.contextMenus.update("twitter",{
            title: (hotkey!="None" ? hotkey + ") " + twTitle : twTitle)
        });

        chrome.contextMenus.update("daum",{
            title: (hotkey!="None" ? hotkey + ") " + dmTitle : dmTitle)
        });
    
        chrome.contextMenus.update("instagram",{
            title: (hotkey!="None" ? hotkey + ") " + inTitle : inTitle)
        });

        if(created){
            chrome.contextMenus.update("tistory",{
                title: (hotkey!="None" ? hotkey + ") " + tiTitle : tiTitle)
            });
        }
    }); 
});

function createTistoryMenu() {
    if (created == false) {
        chrome.contextMenus.create({
            title: (hotkey!="None" ? hotkey + ") " + tiTitle : tiTitle),
            contexts: ["image"],
            id: "tistory"
        });
        created = true;
    }
}

function removeTistoryMenu() {
    if (created == true) {
        chrome.contextMenus.remove("tistory");
        created = false;
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
				chrome.tabs.sendMessage(tabs[0].id, "insta" , function (response) {
					chrome.downloads.download({
						url: response
                    });
				});
			}
			else {
				chrome.tabs.executeScript(tabs[0].id, { file: "injection.js" }, function () {
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
    else if (info.menuItemId == "tistory" || info.menuItemId == "daum") {

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
    checkTistory();
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        if (tab.url.includes("twitter.com") || tab.url.includes("instagram.com") ) {
            removeTistoryMenu();
        } else {
            checkTistory();
        }
    }
});



