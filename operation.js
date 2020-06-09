/* Variables */
var hotkey = "None";
var tistoryMenuCreatedYn = false;

/* Constant Values */
const menuText = "Download Original Image";
const imagePatterns =  [
    "https://twitter.com/*", 
    "https://*.daum.net/*", 
    "http://*.daum.net/*",
    "https://*.tistory.com/*"
];
const pagePatterns = ["https://www.instagram.com/p/*"];

const urlRegexp = {
    'twitter' : new RegExp(/https:\/\/twitter\.com\/(\S)*/, 'g'),
    'daum' : new RegExp(/(\w)*\.daum\.net\/(\S)*/, 'g'),
    'instagram' : new RegExp(/https:\/\/www.instagram\.com\/[\S]*/, 'g'),
    'tistory' : new RegExp(/https:\/\/(\w)*.tistory\.com\/[\S]*/, 'g')
};

/* Chrome Settings */
chrome.storage.local.get({
    hotkeyOption: "None"
}, function(items) {    
    hotkey = items.hotkeyOption;

    chrome.contextMenus.create({
        title: getMenuText(),
        contexts: ["image"],
        documentUrlPatterns: imagePatterns,
        id: "image"
    });

    chrome.contextMenus.create({
        title: getMenuText(),
        contexts: ["page"],
        documentUrlPatterns: pagePatterns,
        id: "page"
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get({
        hotkeyOption: "None"
    }, function(items) {
        hotkey = items.hotkeyOption;

        chrome.contextMenus.update("image", {
            title: getMenuText()
        });

        chrome.contextMenus.update("page", {
            title: getMenuText()
        });
    }); 
});

function getMenuText() {
    return (hotkey == "None" ? "" : hotkey) + menuText;
}


/* Download */
chrome.contextMenus.onClicked.addListener(function onClick(info, tab) {    
    if (tab.url.match(urlRegexp['twitter']) != null) {
        var urlMap = parsingUrl(info.srcUrl);

        chrome.downloads.download({
            url: urlMap["baseUrl"] + "?format=jpg&name=4096x4096",
            filename: urlMap["fileName"] + ".jpg"
        });
    } else if (tab.url.match(urlRegexp['daum']) != null || tab.url.match(urlRegexp['tistory']) != null) {
        chrome.downloads.download({
            url: info.srcUrl + "?original"
        });
    } else if (tab.url.match(urlRegexp['instagram']) != null) {
        downloadInstagramImage();
    } else if (info.menuItemId == 'tistory') {
        chrome.downloads.download({
            url: info.srcUrl + "?original"
        });
    } else {
        alert("인식할 수 없는 URL입니다!. " + tab.url);
    }
});

function parsingUrl(url) {
    var map = {};
    var baseSplit = url.split('?');

    map["baseUrl"] = baseSplit[0];
    map["fileName"] = baseSplit[0].split("/")[4];

    return map;
}

function downloadInstagramImage() {
    console.log("[download_Insta] ENTER");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].url.match(/chrome:\/\/(\S)*/)) {
            return;
        }

        const tabId = tabs[0].id;

		chrome.tabs.sendMessage(tabId, { type: 'insta' }, function (response) {
            if (response != null) {
                chrome.downloads.download({
                    url: response
                });
            } else {
                console.log("[download_Insta] RESPONSE NULL, execute Script.");

                chrome.tabs.executeScript(tabId, { file: "injection.js" }, function () {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						throw Error("Unable to inject script into tab" + tabId);
                    }
                    
					chrome.tabs.sendMessage(tabId, { type: 'insta' }, function (response) {
						chrome.downloads.download({
							url: response
                        });               
					});
				});
            }
		});		
	});
}

/* For Unspecific Tistory Page */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log("update_listener");

    if (changeInfo.status == "complete") {
        for (var regexp in urlRegexp) {
            if (tab.url.match(regexp) != null) {
                return;
            }
        }

        checkTistoryPage();
    }
});

function checkTistoryPage() {
    console.log("download_tistory");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].url.match(/chrome:\/\/(\S)*/)) {
            return;
        }

        const tabId = tabs[0].id;

        chrome.tabs.sendMessage(tabId, { type: 'tistory' }, function (response) {
            if (response != null) {
                if (response == true) {
                    createTistoryMenu();
                }  
            } else {
                chrome.tabs.executeScript(tabId, { file: "injection.js" }, function () {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        throw Error("Unable to inject script into tab" + tabId);
                    }
                    
                    chrome.tabs.sendMessage(tabId, { type: 'tistory' }, function (response) {
                        if (response == true) {
                            createTistoryMenu();
                        }     
                    });                
                });
            }
        });
    });    
}

function createTistoryMenu() {
    if (!tistoryMenuCreatedYn) {
        chrome.contextMenus.create({
            title: getMenuText(),
            contexts: ["image"],
            id: "tistory"
        });

        tistoryMenuCreatedYn = true;
    }
}

function removeTistoryMenu() {
    if (tistoryMenuCreatedYn) {
        chrome.contextMenus.remove("tistory");

        tistoryMenuCreatedYn = false;
    }
}