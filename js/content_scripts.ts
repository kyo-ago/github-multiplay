/**
 * Created by kyo on 2013/07/20.
 */
/// <reference path="../typings/chrome.d.ts" />

(() => {
    var scp = document.createElement('script');
    scp.src = (<any>chrome.extension).getURL('/web_accessible_resources/inner.js');
    document.body.appendChild(scp);
})();
