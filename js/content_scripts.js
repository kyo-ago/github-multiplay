(function () {
    var scp = document.createElement('script');
    scp.src = (chrome.extension).getURL('/web_accessible_resources/inner.js');
    document.body.appendChild(scp);
})();
//@ sourceMappingURL=content_scripts.js.map
