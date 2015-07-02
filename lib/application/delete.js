
// Delete actions

Bisia.Delete = {

	eventComment: function(e, obj) {
		Meteor.call('deleteEventComment', obj, function (error, result) {
			if (result)
				$('.autosize').textareaAutoSize();
				return Bisia.Ui.submitSuccess("Il commento è stato eliminato correttamente.", null, null, true);
		});
	},

	postComment: function(e, obj) {
		Meteor.call('deletePostComment', obj, function (error, result) {
			if (result)
				return Bisia.Ui.submitSuccess("Il commento è stato eliminato correttamente.", null, null, true);
		});
	},

	event: function(e, obj) {
		Meteor.call('deleteEvent', obj, function (error, result) {
			if (result) {
				Router.go('homePage');
				return Bisia.Ui.submitSuccess("L'evento è stato eliminato correttamente.", null, null, true);
			}
		});
		if (obj.imageUrl.length > 0) {
			Meteor.call('cloudinary_delete', Bisia.Img.getImagePublicId(obj.imageUrl), function(error, result) {
				if (error) {
					console.log(error);
				}
			});
		}
	},

	post: function(e, obj) {
		Meteor.call('deletePost', obj, function (error, result) {
			if (result) {
				if (Router.current().route.getName() == 'singlePost') Router.go('homePage');
				return Bisia.Ui.submitSuccess("Il post è stato eliminato correttamente.", null, null, true);
			}
		});
		if (obj.imageUrl.length > 0) {
			Meteor.call('cloudinary_delete', Bisia.Img.getImagePublicId(obj.imageUrl), function(error, result) {
				if (error) {
					console.log(error);
				}
			});
		}
	}

}

Meteor.methods({
	deleteEventComment: function(obj) {
		if (obj.eventId) {
			Notifications.remove({ 'actionKey': 'eventComment', 'actionId': obj.eventId });
			Notifications.remove({ 'actionKey': 'event', 'actionId': obj.eventId });
			Events.update({ '_id': obj.eventId, 'joiners.authorId': this.userId }, { '$set': { 'joiners.$.text': '' } });
			return true;
		}
		return false;
	},
	deletePostComment: function(obj) {
		if (obj.postId && obj.text) {
			Notifications.remove({ 'actionKey': 'comment', 'actionId': obj.postId });
			Posts.update({ _id: obj.postId }, {
				$pull: {
					'comments': {
						'text': obj.text,
						'authorId': this.userId
					}
				},
				$inc: {
					'commentsCount': -1
				}
			});
			return true;
		}
		return false;
	},
	deleteEvent: function(obj) {
		if (obj.eventId) {
			Notifications.remove({ 'actionId': obj.eventId });
			Homepage.update({}, { $pull: { 'todayEvents': obj.eventId, 'tomorrowEvents': obj.eventId } });
			Events.remove(obj.eventId);
			return true;
		}
		return false
	},
	deletePost: function(obj) {
		if (obj._id && obj.authorId == this.userId) {
			Notifications.remove({ 'actionId': obj._id });
			Homepage.update({}, { $pull: { 'blogSelection': obj._id } });
			Posts.remove(obj._id);
			return true;
		}
		return false;
	}
});