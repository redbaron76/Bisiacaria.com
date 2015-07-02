Template.sharePostModal.helpers({
	joinWithAuthor: function() {
		var instance = Template.instance();
		var postAuthor = instance['data']['post']['authorId'];
		if (postAuthor == this['userId']) return false;
		var user = Users.findOne({ '_id': this['userId'] }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1
		}});
		return _.extend(this, _.omit(user, '_id'));
	},
});

Template.sharePostModal.events({
	'submit #share-post-form': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, null);
		var shareArr = formObject['share'];
		var arrLength = shareArr.length;

		if (arrLength > 0) {
			Meteor.call('sharePost', this.post, shareArr, function(error, result) {
				if(error) {
					Bisia.log('sharePost', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					Bisia.Form.cleanFormFields();
					// Bisia.Ui.toggleModal(e);
					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'tab')
							.submitSuccess('Hai condiviso questo post con ' + arrLength + ' dei tuoi contatti.', 'Condiviso!', null, true);
				}
			});
		}
	}
});