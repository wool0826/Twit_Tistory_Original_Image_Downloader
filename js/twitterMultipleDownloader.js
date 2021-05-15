/* Icon URI */
const iconUrl = chrome.runtime.getURL("../icon/icon24.png");

/* Query Selector */
const downloadButtonClassName = "org-down";

const articleQuerySelector = "div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu";
const articleImageQuerySelector = "img.css-9pa8cd[src^='https://pbs.twimg.com/media/']";
const articleToolbarQuerySelector = "div.css-1dbjc4n.r-18u37iz.r-1wtj0ep.r-1s2bzr4.r-1mdbhws";

const wrapperClass = "css-1dbjc4n r-18u37iz r-1h0z5md";
const buttonWrapperClass = "css-18t94o4 css-1dbjc4n r-1777fci r-bt1l66 r-1ny4l3l r-bztko3 r-lrvibr";
const paddingWrapperClass = "css-901oao r-1awozwy r-9ilb82 r-6koalj r-1qd0xha r-a023e6 r-16dba41 r-1h0z5md r-rjixqe r-bcqeeo r-o7ynqc r-clp7b1 r-3s2u2q r-qvutc0";
const paddingClass = "css-1dbjc4n r-1niwhzg r-sdzlij r-1p0dtai r-xoduu5 r-1d2f490 r-xf4iuw r-1ny4l3l r-u8s1d r-zchlnj r-ipm5af r-o7ynqc r-6416eg"
const downloadImageClass = "r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1hdv0qi " + downloadButtonClassName;

setInterval(function() {
    const articles = document.querySelectorAll(articleQuerySelector);

    for (const articleIndex in articles) {
        if (!(articles[articleIndex] instanceof Node)) {
            continue;
        }

        // check this article has images
        const images = articles[articleIndex].querySelectorAll(articleImageQuerySelector);
        if (images.length <= 0) {
            continue;
        }

        // query toolbar in this article to attach download button.
        const toolbar = articles[articleIndex].querySelector(articleToolbarQuerySelector);

        if (!existDownloadButtonIn(toolbar)) {
            const imageLinks = [];
            for (const imageIndex in images) {
                if (images[imageIndex].src != null) {
                    imageLinks.push(images[imageIndex].src);
                }
            }

            toolbar.appendChild(generateDownloadButton(imageLinks));
        }
    }
}, 500);

function existDownloadButtonIn(toolbar) {
    if (toolbar == null) {
        return true;
    }

    const buttons = toolbar.getElementsByClassName(downloadButtonClassName);
    return buttons.length > 0;
}

function generateDownloadButton(imageLinks) {
    const toplevelWrapper = generateDOMElement({
        type: "div",
        className: wrapperClass
    });

    const buttonWrapper = generateDOMElement({
        type: "div",
        parentNode: toplevelWrapper,
        className: buttonWrapperClass,
        attributes: [
            { name: "aria-expanded", value: "false" },
            { name: "role", value: "button" },
            { name: "tabindex", value: "0" }
        ],
        onclickFunction: function() {
            chrome.runtime.sendMessage({ type: "twitterMultiple", links: imageLinks }, /* callback */ );
        }
    });

    const paddingWrapper = generateDOMElement({
        type: "div",
        parentNode: buttonWrapper,
        className: paddingWrapperClass,
        attributes: [
            { name: "dir", value: "ltr" }
        ]
    });

    const padding = generateDOMElement({
        type: "div",
        parentNode: paddingWrapper,
        className: paddingClass
    });

    const downloadButton = generateDOMElement({
        type: "img",
        parentNode: paddingWrapper,
        className: downloadImageClass,
        src: iconUrl
    });

    return toplevelWrapper;
}

function generateDOMElement(params) {
    if (params.type == null || params.className == null) {
        return null;
    }

    const element = document.createElement(params.type);
    element.className = params.className;

    if (params.attributes != null) {
        for (index in params.attributes) {
            element.setAttribute(params.attributes[index].name, params.attributes[index].value);
        }
    }

    if (params.onclickFunction != null) {
        element.onclick = params.onclickFunction;
    }

    if (params.src != null) {
        element.src = params.src;
    }

    if (params.parentNode != null) {
        params.parentNode.appendChild(element);
    }

    return element;
}

