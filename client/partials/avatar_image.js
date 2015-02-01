Template.avatarImage.helpers({
	hasImage: function() {
		var avatar = this.profile.avatar;
		return avatar && avatar.length > 0;
	},
	avatarImage: function() {
		var avatar = this.profile.avatar;
		if (avatar.length > 0)
			return avatar;
	}
});