
// Message

Bisia.Message = {

	/**
	 * The target object
	 * @type {ReactiveVar}
	 */
	target: new ReactiveVar(),

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	sendMessage: function(text) {
		if (text && text.length > 0) {

			var msgObj = {
				targetId: this.target.get().targetId,
				text: text
			};

			Meteor.call('sendMessage', msgObj, function(error, success) {
				if(error)
					Bisia.log(error);

				if(success) {
					Bisia.Ui.sendMessage();
				}
			});
		}
	},

	/**
	 * Set the target of message
	 * @param {Object} obj this
	 */
	setTarget: function(obj) {
		this.target.set({
			targetId: obj._id,
			username: obj.username,
			gender: obj.profile.gender
		});
	},

	/**
	 * Unset the target of message
	 */
	unsetTarget: function() {
		this.target.set();
	}

};