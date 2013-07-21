/**
 * Created by kyo on 2013/07/21.
 */
declare var editor;
addEventListener('message', function (evn) {
    if (evn.source != window)
        return;

    if (evn.data.type === 'setValue')
        editor.setCode(evn.data.value);
    if (evn.data.type === 'update')
        editor.setCode(editor.code());
});