/**
 * Created by kyo on 2013/07/21.
 */
declare var editor;

var addTab = (tab) => {
    tab.insertAdjacentHTML('BeforeEnd', '<li><a href="#" class="multiplay minibutton">Multiplay</a></li>');
    [].slice.apply(tab.querySelectorAll('a')).forEach((elem, idx) => {
        elem.dataset['index'] = idx;
    });
};
var clickTab = (tab) => {
    tab.addEventListener('click', (evn) => {
        evn.preventDefault();
        var current:any = <HTMLElement>tab.querySelector('.selected');
        current.classList.remove('selected');
        var src:any = <HTMLElement>evn.srcElement;
        src.classList.add('selected');

        var js_commit = document.querySelectorAll('.js-commit-create, .js-commit-multiplay, .js-commit-preview');
        (<HTMLElement>js_commit[current.dataset['index']]).style.position = 'absolute';
        (<HTMLElement>js_commit[src.dataset['index']]).style.position = '';
    });
};
var addEditor = (callback) => {
    var div = document.createElement('div');
    div.classList.add('js-commit-multiplay');
    div.classList.add('github-multiplay');

    var iframe = document.createElement('iframe');
    iframe.src = 'http://kyo-ago.github.io/github-multiplay/editor.html' + location.hash;
    iframe.style.width = '100%';
    iframe.style.height = document.getElementById('ace-editor').style.height;
    iframe.style.margin = '0px 0px -5px 0px';
    div.appendChild(iframe);
    iframe.addEventListener('load', callback, false);

    var target = <HTMLElement>document.querySelector('.js-commit-create');
    target.insertAdjacentElement('afterEnd', div);
};
var exchangeMessage = function () {
    var contentWindow = this.contentWindow;
    var post = (data) => {
        contentWindow.postMessage(data, 'http://kyo-ago.github.io');
    };
    post({
        'type' : 'load',
        'clientId' : '629725110204.apps.googleusercontent.com',
        'value' : editor.code()
    });
    var handlers = {
        'setValue' : (data) => {
            editor.setCode(data['value']);
        },
        'updateHash' : (data) => {
            location.hash = data['value'];
        }
    };
    (<any>window).addEventListener('message', function (evn) {
        if (evn.source !== contentWindow) {
            return;
        }
        var data = evn.data;
        var handler = handlers[data['type']];
        handler && handler(data);
    }, false);
    (<any>editor.ace).getSession().on('change', () => {
        post({
            'type' : 'setValue',
            'value' : editor.code()
        });
    });
};
addEventListener('load', () => {
    var tab = <HTMLElement>document.querySelector('.edit-preview-tabs');
    addTab(tab);
    clickTab(tab);
    var link = tab.lastElementChild.querySelector('a');
    var click = () => {
        addEditor(exchangeMessage);
        link.removeEventListener('click', click, true);
    };
    link.addEventListener('click', click, true);
}, false);
