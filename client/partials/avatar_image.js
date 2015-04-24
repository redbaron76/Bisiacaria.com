Template.avatarImage.helpers({
	hasImage: function() {
		var avatar = this.data.profile.avatar;
		return avatar && avatar.length > 0;
	},
	avatarImage: function() {
		var avatar = this.data.profile.avatar;
		if (avatar.length > 0)
			return avatar;
	},
	itsOnline: function() {
		return (this.online && this.data.profile.online) ? 'online' : '';
	}
});