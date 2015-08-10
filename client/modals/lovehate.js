Template.loveHateModal.events({
	'submit #lovehate-form': function(e, t) {
		e.preventDefault();
		var $form = $(e.target);
		var currentUser = this._id;

		var textAreas = $form.find('textarea');
		var lovehate = {};

		_.each(textAreas, function(textArea, index) {
			var value = $(textArea).val();
			lovehate['lh'+(index+1)] = value;
		});

		Meteor.call('saveLoveHate', lovehate, function(error, result) {
			if (result) {
				Bisia.Ui.loadingRemove()
						.waitStop()
						.toggleModal(e);
			}
		});

	},
	/*'click .send-check': function(e, t) {
		e.preventDefault();
		var $form = $('#lovehate-form');
		$form.trigger('submit');
	}*/
});

Template.answerLoveHate.helpers({
	answer: function() {
		if(this.data) {
			return this.data[this['lh']];
		}
	}
});