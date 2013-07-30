var editor = ace.edit('multiplayEditor');
editor.setTheme("ace/theme/monokai");
editor.getSession().setMode("ace/mode/javascript");

addEventListener('message', function (evn) {
    if (evn.origin !== 'https://github.com') {
        return;
    }
    var handler = handlers[evn['data']['type']];
    handler && handler(evn);
});

var handlers = {
    'makeReceiveMessage': function (evn) {
        return function (data) {
            evn['source']['postMessage'](data, evn['origin']);
        };
    },
    'setValue': function (evn) {
        var fromParent = evn['data'];
        editor.setValue(fromParent['value']);
    },
    'load': function (evn) {
        var fromParent = evn['data'];
        var receiveMessage = handlers['makeReceiveMessage'](evn);
        RealtimeAPI['clientId'] = fromParent['clientId'];
        var scp = document.createElement('script');
        scp.src = 'https://apis.google.com/js/api.js';
        document.head.appendChild(scp);

        editor.setValue(fromParent['value']);
        editor.setTheme(fromParent['theme']);

        var session = editor.getSession();
        session.setMode(fromParent['mode']);
        (session).setOptions(fromParent['options']);

        scp.addEventListener('load', function () {
            RealtimeAPI({
                'fileLoaded': function (doc) {
                    var string = doc.getModel().getRoot().get('text');
                    var updateText = function (evn) {
                        var value = string + '';
                        editor.setValue(fromParent['value']);
                        receiveMessage({
                            'type': 'setValue',
                            'value': value
                        });
                    };
                    editor.on('change', function () {
                        string.setText(editor.getValue());
                    });
                    string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateText);
                    string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateText);
                    updateText({});
                },
                'initializeModel': function (model) {
                    var string = model.createString(editor.getValue());
                    model.getRoot().set('text', string);
                },
                'updateHash': function (hash) {
                    receiveMessage({
                        'type': 'updateHash',
                        'value': hash
                    });
                },
                'mimeType': null,
                'title': 'github-multiplay',
                'autoCreate': true
            });
        });
    }
};
//@ sourceMappingURL=editor.js.map
