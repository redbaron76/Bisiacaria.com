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
		var find = { '_id': this.data.userId, 'profile.online': true };
		if(this.online && (this.data.profile.online || Users.find(find).count()) > 0) {
			return 'online';
		}
	}
});