/// <reference path="../typings/codemirror.d.ts" />

declare var RealtimeAPI;
declare var gapi;

var editor = CodeMirror(document.getElementById('multiplayEditor'), {
    'mode' : 'gfm',
    'lineNumbers' : true,
    'lineWrapping' : true,
    'readOnly' : true
});
var doc = editor.getDoc();

addEventListener('message', function (evn) {
    if (evn.origin !== 'https://github.com') {
        return;
    }
    var handler = handlers[evn['data']['type']];
    handler && handler(evn);
});

var handlers = {
    'makeReceiveMessage' : function (evn) {
        return function (data) {
            evn['source']['postMessage'](data, evn['origin']);
        };
    },
    'setValue' : function (evn) {
        var fromParent = evn['data'];
        doc.setValue(fromParent['value']);
    },
    'load' : function (evn) {
        var fromParent = evn['data'];
        var receiveMessage = handlers['makeReceiveMessage'](evn);
        RealtimeAPI['clientId'] = fromParent['clientId'];
        var scp = document.createElement('script');
        scp.src = 'https://apis.google.com/js/api.js';
        document.head.appendChild(scp);

        doc.setValue(fromParent['value']);

        scp.addEventListener('load', function () {
            RealtimeAPI({
                'fileLoaded' : function (doc) {
                    editor.setOption('readOnly', false);
                    var string = doc.getModel().getRoot().get('text');
                    var ignore_change = false;
                    doc.setValue(fromParent['value']);
                    editor.on('beforeChange', function (editor, change) {
                        if (ignore_change) {
                            return;
                        }
                        var from = doc.indexFromPos(change.from);
                        var to = doc.indexFromPos(change.to);
                        if (to - from > 0){
                            string.removeRange(from, to);
                        }
                        var text = change.text.join('\n');
                        if (text.length) {
                            string.insertString(from, text);
                        }
                    });
                    editor.on('blur', function () {
                        receiveMessage({
                            'type' : 'setValue',
                            'value' : doc.getValue()
                        });
                    });
                    string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, function (evn) {
                        if (evn.isLocal) {
                            return;
                        }
                        var from = doc.posFromIndex(evn.index);
                        ignore_change = true;
                        doc.replaceRange(evn.text, from, from);
                        ignore_change = false;
                    });
                    string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, function (evn) {
                        if (evn.isLocal) {
                            return;
                        }
                        var from = doc.posFromIndex(evn.index);
                        var to = doc.posFromIndex(evn.index + evn.text.length);
                        ignore_change = true;
                        doc.replaceRange("", from, to);
                        ignore_change = false;
                    });
                },
                'initializeModel' : function (model) {
                    var string = model.createString(fromParent['value']);
                    model.getRoot().set('text', string);
                },
                'updateHash' : function (hash) {
                    receiveMessage({
                        'type' : 'updateHash',
                        'value' : hash
                    });
                },
                'mimeType' : null,
                'title' : 'github-multiplay',
                'autoCreate' : true
            });
        });
    }
};

