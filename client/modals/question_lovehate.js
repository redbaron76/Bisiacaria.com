Template.answerProfileQuestion.helpers({
	question: function() {
		return this['title'];
	},
	answer: function() {
		if(this.data) {
			return this.data[this['q']];
		}
	}
});