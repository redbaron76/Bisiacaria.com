Template.questionModal.events({
	'submit #question-form': function(e, t) {
		e.preventDefault();
		var $form = $(e.target);
		var currentUser = this._id;

		var textAreas = $form.find('textarea');
		var question = {};

		_.each(textAreas, function(textArea, index) {
			var value = $(textArea).val();
			question['q'+(index+1)] = value;
		});

		Meteor.call('saveQuestion', question, currentUser, function(error, result) {
			if (result)
				Bisia.Ui.resetFormMessages();

			if (error)
				Bisia.log(error);
		});

	},
	'click .send-check': function(e, t) {
		e.preventDefault();
		var $form = $('#question-form');
		$form.trigger('submit');
	}
});

Template.answerQuestion.helpers({
	question: function() {
		return this['title'];
	},
	answer: function() {
		if(this.data) {
			return this.data[this['q']];
		}
	}
});