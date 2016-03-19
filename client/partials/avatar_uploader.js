Template.avatarUploader.events({
    'change #avatar-profile': function(e, instance) {
        var file = e.currentTarget.files[0];
        Bisia.Upload.startUpload(file, 'avatar', function() {
            // onBeforeUpload
            instance.$('.uploader > .indicator').addClass('loading');
        }, function(fileObj) {
            // onAfterUpload
            Bisia.Upload.updateUserAvatar(fileObj, function(pictureUrl, avatarUrl) {
                Meteor.setTimeout(function() {
                    Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': avatarUrl, 'profile.picture': pictureUrl }});
                    instance.$('.uploader > .indicator').removeClass('loading').find('span').html('');
                    Bisia.Upload.progress.set(null);
                }, 2 * 1000);
            });
        });
    }
});