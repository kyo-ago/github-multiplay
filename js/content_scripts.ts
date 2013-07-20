/**
 * Created by kyo on 2013/07/20.
 */
/// <reference path="../typings/chrome.d.ts" />
/// <reference path="../typings/codemirror.d.ts" />
declare var Firebase;
declare var Firepad;
declare var editor;
(() => {
    var target = <HTMLElement>document.querySelector('.js-commit-create');
    if (!target) {
        return;
    }
    var div = document.createElement('div');
    div.classList.add('js-commit-create');

    var base_url = (<String>location.href).replace(/[\W_]/g, (char) => {
        return '_' + char.charCodeAt(0).toString(16).toUpperCase();
    });
    var firepadRef = new Firebase('https://firepad.firebaseio.com/home/?' + base_url);

    var codeMirror = CodeMirror(div, {
        'lineWrapping' : true
    });
    target.insertAdjacentElement('afterEnd', div);
    target.style.display = 'none';

    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
    firepad.on('ready', () => {
        if (!firepad.getText()) {
            var textarea = <HTMLTextAreaElement>document.querySelector('#blob_contents');
            firepad.setText(textarea.value);
        }
        codeMirror.on('change', () => {
            var ace = <HTMLTextAreaElement>document.querySelector('textarea.ace_text-input');
            var event:any = document.createEvent('TextEvent');
            ace.value = firepad.getText();
            event.initTextEvent('textInput', true, false, <AbstractView>window, 'a', 0x09, 'ja');
            ace.dispatchEvent(event);
        });
    });
})();
