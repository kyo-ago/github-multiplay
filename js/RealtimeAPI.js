var RealtimeAPI = (function () {
    "use strict";
    var self = function (options) {
        self.load(options);
    };
    self['clientId'] = '';
    self.hashParams = {};
    self.userId = '';
    self.options = {};
    self.load = function (options) {
        self.options = options;
        self.hashParams = self.getParams(location.hash);
        gapi.load('auth:client,drive-realtime,drive-share', function() {
            gapi.auth.authorize(self.getAuthOption(), function (result) {
                if (result && !result['error']) {
                    return self.getUserId(self.authCompleted);
                }
                self.authorize(function () {
                    self.getUserId(self.authCompleted);
                });
            });
        });
    };
    self.authCompleted = function () {
        var fileIds = self.hashParams['fileIds'];
        var state = self.hashParams['state'];
        if (fileIds) {
            return self.realtimeLoad(fileIds);
        }
        if (state) {
            var stateObj = self.JSONparse(state) || {};
            if (stateObj['action'] === 'open') {
                self.redirectTo(stateObj['ids'], stateObj['userId']);
                return;
            }
        }
        if (self.options['autoCreate']) {
            self.createNewFileAndRedirect();
        }
    };
    self.redirectTo = function (fileIds, userId) {
        var fileId = fileIds.join(',');
        var hash = [
            'fileIds=' + fileId,
            'userId=' + userId
        ].join('&');
        location.hash = hash;
        var updateHash = self.options['updateHash'];
        updateHash && updateHash(hash);
        self.hashParams = self.getParams(location.hash);
        if (fileId) {
            self.realtimeLoad(fileId);
        }
    };
    self.createNewFileAndRedirect = function () {
        gapi.client.load('drive', 'v2', function() {
            gapi.client.drive.files.insert({
                'resource': {
                    'mimeType' : self.options['mimeType'],
                    'title' : self.options['title']
                }
            }).execute(function (file) {
                        if (!file['id']) {
                            console.error('Error creating file.', file);
                            return;
                        }
                        self.redirectTo([file['id']], self.userId);
                    });
        });
    };
    self.realtimeLoad = function (fileIds) {
        fileIds.split(',').forEach(function (fileId) {
            gapi.drive.realtime.load(fileId, self.options['fileLoaded'], self.options['initializeModel'], self.handleErrors);
        });
    };
    self.JSONparse = function (text) {
        try {
            return JSON.parse(state);
        } catch (e) {
        }
    };
    self.getAuthOption = function () {
        return {
            'client_id' : self['clientId'],
            'scope' : [
                'https://www.googleapis.com/auth/drive.install',
                'https://www.googleapis.com/auth/drive.file',
                'openid'
            ],
            'user_id' : self.hashParams['userId'] || '',
            'immediate' : true
        };
    };
    self.authorize = function (callback) {
        gapi.auth.authorize(self.extend(self.getAuthOption(), {
            'immediate' : false
        }), function (result) {
            if (result && !result['error']) {
                return callback();
            }
            self.authorize(callback);
        });
    }
    self.extend = function () {
        var result = {};
        [].slice.apply(arguments).forEach(function (val) {
            Object.keys(val).forEach(function (key) {
                result[key] = val[key];
            });
        });
        return result;
    };
    self.getUserId = function (callback) {
        gapi.client.load('oauth2', 'v2', function() {
            gapi.client.oauth2.userinfo.get().execute(function(resp) {
                self['userId'] = resp['id'];
                callback();
            });
        });
    };
    self.getParams = function (hash) {
        var result = {};
        (hash||'').slice(1).split('&').forEach(function (strs) {
            var pear = strs.split('=');
            result[pear[0]] = unescape(pear[1]);
        });
        return result;
    };
    self.handleErrors = function (evn) {
        var types = gapi.drive.realtime.ErrorType;
        var errors = {};
        errors[types['TOKEN_REFRESH_REQUIRED']] = function () {
            authorizer.authorize();
        };
        errors[types['CLIENT_ERROR']] = function () {
            alert('An Error happened: ' + evn.message);
        };
        errors[types['NOT_FOUND']] = function () {
            alert('The file was not found. It does not exist or you do not have read access to the file.');
        };
        errors[evn['type']]();
    };
    return self;
})();