/* Variables */
var hotkey = "None";
var sortOption = "None";
var tistoryMenuCreatedYn = false;

/* Constant Values */
const extensionId = chrome.runtime.id;
const baseMenuText = "Download Original Image";
const imagePatterns =  [
    "https://twitter.com/*", 
    "https://*.daum.net/*", 
    "http://*.daum.net/*",
    "https://*.tistory.com/*"
];
const pagePatterns = ["https://www.instagram.com/p/*"];
const linkPatterns = ["https://tweetdeck.twitter.com/*"];

const urlRegexp = {
    'twitter': new RegExp(/https:\/\/twitter\.com\/[\S]*/, 'g'),
    'daum': new RegExp(/[\S]*\.daum\.net\/[\S]*/, 'g'),
    'instagram': new RegExp(/https:\/\/www.instagram\.com\/[\S]*/, 'g'),
    'tistory': new RegExp(/https:\/\/[\S]*\.tistory\.com\/[\S]*/, 'g'),
    'tweetdeck-site': new RegExp(/https:\/\/tweetdeck\.twitter\.com/, 'g')
};

const settingPageRegexp = {
    'chrome': new RegExp(/chrome:\/\/[\S]*/),
    'whale': new RegExp(/whale:\/\/[\S]*/),
}

/* Chrome Settings */
chrome.storage.local.get({
    hotkeyOption: "None",
    sortOption: "None"
}, function(items) {    
    hotkey = items.hotkeyOption;
    sortOption = items.sortOption;

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

    chrome.contextMenus.create({
        title: getMenuText(),
        contexts: ["link"],
        documentUrlPatterns: linkPatterns,
        id: "link"
    });
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get({
        hotkeyOption: "None",
        sortOption: "None"
    }, function(items) {
        hotkey = items.hotkeyOption;
        sortOption = items.sortOption;

        chrome.contextMenus.update("image", {
            title: getMenuText()
        });

        chrome.contextMenus.update("page", {
            title: getMenuText()
        });

        chrome.contextMenus.update("link", {
            title: getMenuText()
        });

        if (tistoryMenuCreatedYn) {
            chrome.contextMenus.update("tistory", {
                title: getMenuText()
            });
        }
    }); 
});

function getMenuText() {
    return (hotkey == "None" ? "" : hotkey + " - ") + baseMenuText;
}

/* Download */
chrome.contextMenus.onClicked.addListener(function onClick(info, tab) {
    if (tab.url.match(urlRegexp['twitter']) != null) {
        downloadTwitterImages([ info.srcUrl ]);
    } else if (tab.url.match(urlRegexp['daum']) != null || tab.url.match(urlRegexp['tistory']) != null) {
        downloadImage(info.srcUrl + "?original");
    } else if (tab.url.match(urlRegexp['instagram']) != null) {
        downloadImageForInstagram();
    } else if (info.menuItemId == 'tistory') {
        downloadImage(info.srcUrl + "?original");
    } else if (tab.url.match(urlRegexp['tweetdeck-site']) != null) {
        if (info.srcUrl != null) {
            downloadTwitterImages([ info.srcUrl ]);
        } else {
            downloadImageForTwitterByLink(info.linkUrl);
        }
    } else {
        alert("인식할 수 없는 URL입니다!. " + tab.url);
    }
});


function downloadTwitterImages(imageUrls) {
    for (var index in imageUrls) {
        const urlMap = parsingTwitterUrl(imageUrls[index]);
        downloadImage(urlMap["baseUrl"] + "?format=" + urlMap["format"] + "&name=4096x4096");
    }
}

function parsingTwitterUrl(url) {
    var map = {};

    map["baseUrl"] = url; // set default url
    map["format"] = "jpg"; // set default format

    if (!url.includes('?')) {
        return map;
    }

    const urlSplit = url.split('?');
    map["baseUrl"] = urlSplit[0];

    if (!urlSplit[1].includes('&')) {
        return map;
    }

    const optionSplit = urlSplit[1].split('&');

    for (var i=0; i<optionSplit.length; i++) {
        if (optionSplit[i].includes('=')) {
            const parameter = optionSplit[i].split('=');
            map[parameter[0]] = parameter[1];
        }
    }

    return map;
}

function downloadImage(imageUrl) {
    chrome.downloads.download({
        url: imageUrl
    });
}

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    if (downloadItem.byExtensionId == extensionId) {
        suggest({ filename: getFileNamePrefix() + downloadItem.filename });
    } else {
        suggest({ filename: downloadItem.filename }); 
    }
});

function getFileNamePrefix() {
    var now = new Date();
    const formattedDate = now.toISOString().slice(2,10).replace(/-/g,"");

    if (sortOption == "folderSort") {
        return formattedDate + "/";
    } else if (sortOption == "dateAppend") {
        return formattedDate + "_";
    } else {
        return "";
    }
}

function downloadImageForInstagram() {
    queryWithInjectedCodes({ type: "insta" }, downloadImage);
}

function downloadImageForTwitterByLink(href) {
    queryWithInjectedCodes({ type: "tweetdeck", link: href }, downloadTwitterImages);
}

function checkTistoryPage() {
    queryWithInjectedCodes({ type: "tistory" }, function(response) {
        if (response == true) {
            createTistoryMenu();
        }
    });
}

function queryWithInjectedCodes(request, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (isBrowserSettingPage(tabs[0].url)) {
            return;
        }

        const tabId = tabs[0].id;

        chrome.tabs.sendMessage(tabId, request, function (response) {
            if (response != null) {
                callback(response);
            } else if (chrome.runtime.lastError) {
                chrome.tabs.executeScript(tabId, { file: "js/messageReceiver.js" }, function () {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        throw Error("Unable to inject script into tab" + tabId);
                    }

                    chrome.tabs.sendMessage(tabId, request, function (response) {
                        callback(response);             
                    });
                });
            }
        });		
    });
}

/* For Unspecific Tistory Page */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
        removeTistoryMenu();

        for (var regexp in urlRegexp) {
            if (tab.url.match(regexp) != null) {
                return;
            }
        }

        checkTistoryPage();
    }
});

function isBrowserSettingPage(url) {
    return url.match(settingPageRegexp['chrome']) != null || url.match(settingPageRegexp['whale']) != null;
}

/* Tistory Context Menus */
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "twitterMultiple") {
        downloadTwitterImages(request.links);
    }
});