Template.avatarImage.helpers({
	hasImage: function() {
		var avatar = this.profile.avatar;
		return avatar && avatar.length > 0;
	},
	avatarImage: function() {
		if (this.profile.avatar.length > 0)
			return this.profile.avatar;
	}
});