addEventListener('message', function (evn) {
    if (evn.source != window)
        return;

    if (evn.data.type === 'setValue')
        editor.setCode(evn.data.value);
    if (evn.data.type === 'update')
        editor.setCode(editor.code());
});
//@ sourceMappingURL=inner.js.map
