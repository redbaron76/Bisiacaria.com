Meteor.methods({
    createCroppedAvatar: function(original, avatar, fileObj, version) {
        var im = Meteor.npmRequire("imagemagick");
        Bisia.Upload.addImageVersion(fileObj, version);
        Bisia.Upload.deleteImage(version, fileObj);
        im.convert([
            original,
            '-resize', '200x200^',
            '-gravity', 'Center',
            '-crop', '200x200+0+0',
            '-auto-level',
            '-auto-orient',
            '+repage',
            avatar
        ]);
        Bisia.Upload.compressOriginalFile(original, fileObj, im);
        return true;
    },
    createCroppedPost: function(original, fileObj, versions) {
        var im = Meteor.npmRequire("imagemagick");
        _.each(versions, function(version) {
            Bisia.Upload.addImageVersion(fileObj, version.version);
            im.convert([
                original,
                '-resize', version.resize,
                '-gravity', 'Center',
                '-crop', version.resize + '+0+0',
                '-auto-level',
                '-auto-orient',
                '+repage',
                version.thumb
            ]);
        });
        Bisia.Upload.compressOriginalFile(original, fileObj, im);
        return true;
    },
    createCroppedEvent: function(original, fileObj, versions) {
        var im = Meteor.npmRequire("imagemagick");
        _.each(versions, function(version) {
            Bisia.Upload.addImageVersion(fileObj, version.version);
            im.convert([
                original,
                '-resize', version.resize,
                '-gravity', 'Center',
                '-crop', version.resize + '+0+0',
                '-auto-level',
                '-auto-orient',
                '+repage',
                version.thumb
            ]);
        });
        Bisia.Upload.compressOriginalFile(original, fileObj, im);
        return true;
    },
    deleteServerImage: function(version) {
        if (arguments[1]) {
            var fileId = arguments[1];
            return Bisia.Upload.deleteImage(version, null, fileId);
        } else {
            return Bisia.Upload.deleteImage(version);
        }

    }
});