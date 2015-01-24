Template.answerProfileQuestion.helpers({
	question: function() {
		return this['title'];
	},
	answer: function() {
		return this.data[this['q']];
	}
});