Template.newsEventList.helpers({
	getLocation: function() {
		var routeTo, username = this.username;
		// Bisia.log(this);
		switch(this.actionKey) {
			case 'comment':
			case 'post':
			case 'like':
			case 'unlike':
			case 'share':
			case 'geotag':
				routeTo = 'singlePost';
				break;
			case 'event':
			case 'join':
			case 'commentEvent':
				routeTo = 'singleEvent';
				break;
			case 'nicknameChanged':
			case 'profileData':
			case 'question':
			case 'loveHate':
				routeTo = 'userProfile';
				break;
			case 'myProfile':
				routeTo = 'userProfile';
				username = this.actionId;
				break;
		}
		return _.extend(this, {
			routeTo: routeTo,
			username: username
		});
	}
});