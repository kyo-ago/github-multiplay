var target = document.querySelector('.js-commit-create');
var defer = new Deferred();
(function () {
    if (!target) {
        return;
    }

    var scp = document.createElement('script');
    scp.src = (chrome.extension).getURL('/js/inner.js');
    document.body.appendChild(scp);

    var tab = document.querySelector('.edit-preview-tabs');
    tab.insertAdjacentHTML('BeforeEnd', '<li><a href="#" class="multiplay minibutton">Multiplay</a></li>');
    tab.lastElementChild.querySelector('a').addEventListener('click', defer.call.bind(defer), true);
    [].slice.apply(tab.querySelectorAll('a')).forEach(function (elem, idx) {
        elem.dataset['index'] = idx;
    });
    tab.addEventListener('click', function (evn) {
        evn.preventDefault();
        var current = tab.querySelector('.selected');
        current.classList.remove('selected');
        var src = evn.srcElement;
        src.classList.add('selected');

        var js_commit = document.querySelectorAll('.js-commit-create, .js-commit-multiplay, .js-commit-preview');
        (js_commit[current.dataset['index']]).style.position = 'absolute';
        (js_commit[src.dataset['index']]).style.position = '';

        if (src.classList.contains('code')) {
            postMessage({
                'type': 'update'
            }, location.href);
        }
    });
})();

defer.next(function () {
    if (document.querySelector('.github-multiplay'))
        return;

    var div = document.createElement('div');
    div.classList.add('js-commit-multiplay');
    div.classList.add('github-multiplay');

    var base_url = (location.href).replace(/[\W_]/g, function (char) {
        return '_' + char.charCodeAt(0).toString(16).toUpperCase();
    });
    var firepadRef = new Firebase('https://firepad.firebaseio.com/home/?' + base_url);

    var codeMirror = CodeMirror(div, {
        'lineWrapping': true
    });
    target.insertAdjacentElement('afterEnd', div);

    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
    firepad.on('ready', function () {
        if (!firepad.getText()) {
            var textarea = document.querySelector('#blob_contents');
            firepad.setText(textarea.value);
        }
        codeMirror.on('change', function () {
            postMessage({
                'type': 'setValue',
                'value': firepad.getText()
            }, location.href);
        });
    });
});
//@ sourceMappingURL=content_scripts.js.map
