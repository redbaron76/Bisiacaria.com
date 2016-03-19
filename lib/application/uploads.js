// Upload

Bisia.Upload = {

    fileName: null,

    instance: null,

    progress: new ReactiveVar(null),

    basePath: Meteor.settings.public.upload.basePath,

    baseUrl: Meteor.settings.public.upload.baseUrl,

    init: function() {
        var parent = this;
        this.instance = new Meteor.Files({
            storagePath: parent.basePath,
            collectionName: 'uploads',
            chunkSize: 256*128,
            permissions: 0777,
            allowClientCode: true,
            namingFunction: function() {
                return parent.fileName;
            }
        });
    },

    getFileName: function() {
        this.fileName = Meteor.userId() + '_' + new Date().getTime();
        return this.fileName;
    },

    startUpload: function(file, version, onBeforeUpload, onAfterUpload) {
        var parent = this;

        if (_.isFunction(onBeforeUpload)) {
            onBeforeUpload();
        }

        this.instance.insert({
            file: file,
            streams: 8,
            meta: {
                upload: version,
                userId: Meteor.userId(),
                fileName: parent.getFileName()
            },
            onUploaded: function(error, fileObj) {
                parent.progress.set(100);
                fileObj.fileName = parent.fileName;
                if (_.isFunction(onAfterUpload)) {
                    onAfterUpload(fileObj);
                }
            },
            onProgress: _.throttle(function(progress) {
                if (progress <= 100) {
                    parent.progress.set(parseInt(progress));
                }
            }, 500)
        });
    },

    updateUserAvatar: function(fileObj, callback) {
        var parent = this;
        var original = fileObj.path;
        var avatar = this.getVersionFile(fileObj, 'avatar');

        Meteor.call('createCroppedAvatar', original, avatar, fileObj, 'avatar', function(error, success) {
            if (success) {
                var pictureUrl = parent.buildUrlName(parent.buildFileName(fileObj.fileName, fileObj.extension));
                var avatarUrl = parent.buildUrlName(parent.buildFileName(fileObj.fileName, fileObj.extension, 'avatar'));
                callback(pictureUrl, avatarUrl);
            }
        });
    },

    updateUserPostEvent: function(version, display, fileObj, callback) {
        var versions, method, parent = this;
        var original = fileObj.path;

        switch (version) {
            case 'post':
                method = 'createCroppedPost';
                versions = [{
                    version: 'post',
                    resize: '720x',
                    thumb: this.getVersionFile(fileObj, 'post')
                }];
                break;
            case 'event':
                method = 'createCroppedEvent';
                versions = [{
                    version: 'event',
                    resize: '760x300',
                    thumb: this.getVersionFile(fileObj, 'event')
                }];
                break;
        }

        Meteor.call(method, original, fileObj, versions, function(error, success) {
            if (success) {
                var pictureUrl = parent.buildUrlName(parent.buildFileName(fileObj.fileName, fileObj.extension));
                var thumbUrl = parent.buildUrlName(parent.buildFileName(fileObj.fileName, fileObj.extension, display));
                callback(pictureUrl, thumbUrl);
            }
        });
    },

    compressOriginalFile: function(original, fileObj, im) {
        var copy = original;
        im.convert([
            original,
            '-resize', '800x',
            '-auto-level',
            '-auto-orient',
            '+repage',
            copy
        ]);
    },

    getUpdtVersionObject: function(fileObj, version) {
        var versions = this.instance.collection.findOne({_id: fileObj._id}).versions;
        versions[version] = this.getVersionObject(fileObj, version);
        return versions;
    },

    getVersionObject: function(fileObj, version) {
        return {
            path: this.getVersionFile(fileObj, version),
            size: fileObj.size,
            type: fileObj.type,
            extension: fileObj.extension
        };
    },

    getVersionFile: function(fileObj, version) {
        var versionName = this.buildFileName(fileObj.fileName, fileObj.extension, version);
        return this.basePath + '/' + versionName;
    },

    buildUrlName: function(fileName) {
        var baseUrl = this.baseUrl + '/';
        return baseUrl + fileName;
    },

    buildFileName: function(fileName, ext, version) {
        if (version) {
            fileName = fileName + '_' + version;
        }
        return fileName + '.' + ext.toLowerCase();
    },

    getFileNameFromFile: function(file) {
        return file.split('/').pop().split('.').shift();
    },

    // Execute on SERVER in methods

    addImageVersion: function(fileObj, version) {
        var newVersion = this.getUpdtVersionObject(fileObj, version);
        this.instance.collection.update(fileObj._id, { '$set': {
            versions: newVersion
        }});
    },

    deleteImage: function(version) {
        var images, parent = this;
        var fs = Meteor.npmRequire("fs");
        var except = arguments[1] || null;
        var fileId = arguments[2] || null;

        if (fileId) {
            images = this.instance.collection.find({_id: fileId});
        } else {
            if (_.isString(version)) {
                images = this.instance.collection.find({'meta.upload': version, 'meta.userId': Meteor.userId()});
            } else if (_.isObject(version)) {
                images = this.instance.collection.find(version);
            }
        }

        if (images.count() > 0) {
            images.forEach(function(image) {
                if (!except || except._id !== image._id) {
                    _.each(image.versions, function(version) {
                        var path = version.path;
                        if (path) {
                            fs.exists(path, function(exist) {
                                if (exist) {
                                    fs.unlink(path, function(err) {
                                        console.log('unlink error', err);
                                    });
                                }
                            });
                        }
                    });
                    parent.instance.collection.remove({_id: image._id});
                }
            });
            return true;
        }
        return false;
    }

};