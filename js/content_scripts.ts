/**
 * Created by kyo on 2013/07/20.
 */
/// <reference path="../typings/chrome.d.ts" />
/// <reference path="../typings/codemirror.d.ts" />
/// <reference path="../typings/jsdeferred.d.ts" />
declare var Firebase;
declare var Firepad;
declare var editor;

var target = <HTMLElement>document.querySelector('.js-commit-create');
var defer = new Deferred();
(() => {
    if (!target) {
        return;
    }

    var scp = document.createElement('script');
    scp.src = (<any>chrome.extension).getURL('/js/inner.js');
    document.body.appendChild(scp);

    var tab = <HTMLElement>document.querySelector('.edit-preview-tabs');
    tab.insertAdjacentHTML('BeforeEnd', '<li><a href="#" class="multiplay minibutton">Multiplay</a></li>');
    tab.lastElementChild.querySelector('a').addEventListener('click', defer.call.bind(defer), true);
    [].slice.apply(tab.querySelectorAll('a')).forEach((elem, idx) => {
        elem.dataset['index'] = idx;
    });
    tab.addEventListener('click', (evn) => {
        evn.preventDefault();
        var current:any = <HTMLElement>tab.querySelector('.selected');
        current.classList.remove('selected');
        var src:any = <HTMLElement>evn.srcElement;
        src.classList.add('selected');

        var js_commit = document.querySelectorAll('.js-commit-create, .js-commit-multiplay, .js-commit-preview');
        (<HTMLElement>js_commit[current.dataset['index']]).style.position = 'absolute';
        (<HTMLElement>js_commit[src.dataset['index']]).style.position = '';

        if (src.classList.contains('code')) {
            postMessage({
                'type' : 'update'
            }, location.href);
        }
    });
})();

defer.next(() => {
    if (document.querySelector('.github-multiplay'))
        return;

    var div = document.createElement('div');
    div.classList.add('js-commit-multiplay');
    div.classList.add('github-multiplay');

    var base_url = (<String>location.href).replace(/[\W_]/g, (char) => {
        return '_' + char.charCodeAt(0).toString(16).toUpperCase();
    });
    var firepadRef = new Firebase('https://firepad.firebaseio.com/home/?' + base_url);

    var codeMirror = CodeMirror(div, {
        'lineWrapping' : true
    });
    target.insertAdjacentElement('afterEnd', div);

    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
    firepad.on('ready', () => {
        if (!firepad.getText()) {
            var textarea = <HTMLTextAreaElement>document.querySelector('#blob_contents');
            firepad.setText(textarea.value);
        }
        codeMirror.on('change', () => {
            postMessage({
                'type' : 'setValue',
                'value' : firepad.getText()
            }, location.href);
        });
        codeMirror.scrollTo(0, 0);
    });
});
