var addTab = function (tab) {
    tab.insertAdjacentHTML('BeforeEnd', '<li><a href="#" class="multiplay minibutton">Multiplay</a></li>');
    [].slice.apply(tab.querySelectorAll('a')).forEach(function (elem, idx) {
        elem.dataset['index'] = idx;
    });
};
var clickTab = function (tab) {
    tab.addEventListener('click', function (evn) {
        evn.preventDefault();
        var current = tab.querySelector('.selected');
        current.classList.remove('selected');
        var src = evn.srcElement;
        src.classList.add('selected');

        var js_commit = document.querySelectorAll('.js-commit-create, .js-commit-multiplay, .js-commit-preview');
        (js_commit[current.dataset['index']]).style.position = 'absolute';
        (js_commit[src.dataset['index']]).style.position = '';
    });
};
var addEditor = function (callback) {
    var div = document.createElement('div');
    div.classList.add('js-commit-multiplay');
    div.classList.add('github-multiplay');

    var iframe = document.createElement('iframe');
    iframe.src = 'http://jsrun.it/kyo_ago/github-multiplay-editor' + location.hash;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.margin = '0px 0px -5px 0px';
    div.appendChild(iframe);
    iframe.addEventListener('load', callback, false);

    var target = document.querySelector('.js-commit-create');
    target.insertAdjacentElement('afterEnd', div);
};
var exchangeMessage = function () {
    var contentWindow = this.contentWindow;
    var post = function (data) {
        contentWindow.postMessage(data, 'http://jsrun.it');
    };
    post({
        'type': 'load',
        'clientId': '629725110204.apps.googleusercontent.com',
        'value': editor.code()
    });
    var handlers = {
        'setValue': function (data) {
            editor.setCode(data['value']);
        },
        'updateHash': function (data) {
            location.hash = data['value'];
        }
    };
    (window).addEventListener('message', function (evn) {
        if (evn.source !== contentWindow) {
            return;
        }
        var data = evn.data;
        var handler = handlers[data['type']];
        handler && handler(data);
    }, false);
    (editor.ace).getSession().on('change', function () {
        post({
            'type': 'setValue',
            'value': editor.code()
        });
    });
};
addEventListener('load', function () {
    var tab = document.querySelector('.edit-preview-tabs');
    addTab(tab);
    clickTab(tab);
    var link = tab.lastElementChild.querySelector('a');
    var click = function () {
        addEditor(exchangeMessage);
        link.removeEventListener('click', click, true);
    };
    link.addEventListener('click', click, true);
}, false);
//@ sourceMappingURL=inner.js.map
