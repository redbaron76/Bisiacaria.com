Template.avatarUploader.events({
    'change #avatar-profile': function(e, t) {
        e.preventDefault();
        Bisia.Img.readImage(e, function(dataImg) {
            Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': dataImg, 'profile.picture': dataImg }});
        });
    }
});