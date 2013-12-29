chrome.extension.sendMessage({
    action: "getSource",
    source: document.documentElement.outerHTML
});