
// Message

Bisia.Message = {

	/**
	 * The target object
	 * @type {ReactiveVar}
	 */
	// target: new ReactiveVar(),

	/**
	 * Flag to activare auto bottom on item rendered
	 * @type {Boolean}
	 */
	goToBottom: false,

	/**
	 * Flag to activare auto top on paginating
	 * @type {Boolean}
	 */
	goToFirst: false,

	/**
	 * [IamInChat description]
	 * @type {Boolean}
	 */
	IamInChat: false,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Delete the messege
	 * @param  {Object} e
	 * @param  {Object} obj
	 * @return {Void}
	 */
	deleteMessage: function(e, obj) {
		Meteor.call('deleteMessage', obj.chatId, function (error, result) {
			if (result) {
				// $(e.target).parents('li.tools-open').remove();
				Router.go('getMessages');
			}
		});
	},

	/**
	 * Get the object to provide to a post comment popup
	 * @param  {Object} postObj
	 * @param  {String} template
	 * @return {Object}
	 */
	getCommentObject: function(postObj, template) {
		/*var details = {
			text: postObj.text,
			imageUrl: postObj.imageUrl,
			position: postObj.position
		};*/
		var target = _.pick(postObj, '_id', 'authorId', 'comments', 'likes', 'unlikes');
		var commentAuthors = _.map(target.comments, function(value, key) {
			return value['authorId'];
		});
		var notyIds = Bisia.mergeIds(commentAuthors, target.likes, target.unlikes);
		// remove authorId
		notyIds = _.without(notyIds, target.authorId);
		return {
			template: template,
			postId: target._id,
			targetId: target.authorId,
			notifyIds: notyIds
			// details: details
		};
	},

	/**
	 * Get the object to be used when sending new message
	 * @param  {Object} userObj
	 * @param  {String} template
	 * @return {Object}
	 */
	getMessageObject: function(userObj, template) {
		var target = _.pick(userObj, '_id', 'username', 'profile');
		return {
			template: template,
			targetId: target._id,
			username: target.username,
			gender: target.profile.gender
		};
	},

	/**
	 * Get a chat targetId
	 * @param  {String} chatId
	 * @return {String}
	 */
	getTargetId: function(chatId) {
		check(chatId, String);
		var chat = Messages.findOne({ 'chatId': chatId });
		return (chat.userId == Meteor.userId()) ? chat.targetId : chat.userId;
	},

	/**
	 * messageList rendered
	 * @return {[type]} [description]
	 */
	openChatPage: function() {
		var parent = this;

		if (this.goToFirst) {
			Bisia.Ui.goFirst();
		} else {
			Bisia.Ui.goBottom();
		}

		Meteor.setTimeout(function() {
			parent.goToFirst = false;
			parent.goToBottom = true;
		}, 1000);

		this.IamInChat = true;
	},

	/**
	 * Reset Message properties on LoggedController onBeforeAction
	 * @return {Void}
	 */
	resetMessageProperties: function() {
		// Reset goToFirst property
		Bisia.Message.goToFirst = false;
		// Reset goToTop property
		Bisia.Message.goToBottom = false;
	},

	/**
	 * Send comment to post
	 * @param  {String} text
	 * @return {Bool}
	 */
	sendComment: function(text) {
		if (text && text.length > 0) {
			var fromPopup = arguments[1] ? false : true;
			var target = fromPopup ? Bisia.Ui.popup.get() : arguments[1];
			var targetPost = _.omit(target, 'template');
			text = Bisia.Form.formatEmoj(text);

			Meteor.call('sendComment', targetPost, text, function(error, success) {
				if(error)
					Bisia.log(error);

				if(success) {
					if (fromPopup)
						Bisia.Ui.sendMessage();
				}
			});
			return true;
		}
		return false;
	},

	/**
	 * Send comment to event join
	 * @param  {String} eventId
	 * @param  {String} text
	 * @return {Bool}
	 */
	sendCommentEvent: function(eventId, text) {
		if (text && text.length > 0) {
			text = Bisia.Form.formatEmoj(text);
			Meteor.call('sendCommentEvent', eventId, text, function(error, success) {
				if(error)
					Bisia.log(error);
			});
			return true;
		}
		return false;
	},

	/**
	 * Send a private message
	 * @param  {String} text
	 * @return {Bool}
	 */
	sendMessage: function(text) {
		if (text && text.length > 0) {
			var targetId, chatId = '';

			if(arguments[1] && !Bisia.Ui.popup.get()) {
				chatId = arguments[1];
				targetId = this.getTargetId(chatId);
			} else {
				chatId = '';
				targetId = Bisia.Ui.popup.get().targetId;
			}

			var msgObj = {
				chatId: chatId,
				targetId: targetId,
				text: Bisia.Form.formatEmoj(text),
				isDelete: []
			};

			Meteor.call('sendMessage', msgObj, function(error, success) {
				if(error)
					Bisia.log(error);

				if(success) {
					Bisia.Ui.sendMessage();
					// Bisia.Notification.resetNotify('message');
				}
			});
			return true;
		}
		return false;
	}

};