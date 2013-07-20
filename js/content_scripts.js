(function () {
    var target = document.querySelector('.js-commit-create');
    if (!target) {
        return;
    }
    var div = document.createElement('div');
    div.classList.add('js-commit-create');

    var base_url = (location.href).replace(/[\W_]/g, function (char) {
        return '_' + char.charCodeAt(0).toString(16).toUpperCase();
    });
    var firepadRef = new Firebase('https://firepad.firebaseio.com/home/?' + base_url);

    var codeMirror = CodeMirror(div, {
        'lineWrapping': true
    });
    target.insertAdjacentElement('afterEnd', div);
    target.style.display = 'none';

    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
    firepad.on('ready', function () {
        if (!firepad.getText()) {
            var textarea = document.querySelector('#blob_contents');
            firepad.setText(textarea.value);
        }
        codeMirror.on('change', function () {
            var ace = document.querySelector('textarea.ace_text-input');
            var event = document.createEvent('TextEvent');
            ace.value = firepad.getText();
            event.initTextEvent('textInput', true, false, window, 'a', 0x09, 'ja');
            ace.dispatchEvent(event);
        });
    });
})();
//@ sourceMappingURL=content_scripts.js.map
