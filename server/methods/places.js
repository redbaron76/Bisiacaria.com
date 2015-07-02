Meteor.methods({
	recordPosition: function(locObj, positionObj) {
		check(this.userId, String);
		check(locObj, Object);
		check(positionObj, Object);

		Users.update(this.userId, {
			'$set': {
				'loc': locObj.loc,
				'profile.position': positionObj
			}
		});

		return true;
	}
})