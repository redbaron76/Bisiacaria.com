Meteor.methods({
	deleteImage: function(imgUrl) {
		check(imgUrl, String);
		check(this.userId, String);
		Users.update({ '_id': this.userId }, { $set: { 'profile.avatar': '', 'profile.picture': '' }});
		Bisia.Img.deleteImage(imgUrl);
	}
});