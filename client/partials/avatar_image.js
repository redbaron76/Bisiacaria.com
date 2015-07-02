Template.avatarImage.helpers({
	hasImage: function() {
		var avatar = this.data.profile.avatar;
		if(avatar && avatar.length > 0 && ! Bisia.Img.imageIsInvalid(avatar)) {
			return true;
		}
		return false;
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