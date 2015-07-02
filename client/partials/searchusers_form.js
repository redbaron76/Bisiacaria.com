Template.searchUsersForm.onRendered(function() {
	var instance = this;
	var $from = instance.$('.slider-from');
	var $to = instance.$('.slider-to');
	instance.$("#age-slider").slider({
		min: Bisia.Validation.allowedAge,
		max: 99,
		step: 1,
		value: [20,40],
		tooltip: 'hide',
		formatter: function() {
			$from.html(this.value[0]);
			$to.html(this.value[1]);
		}
	});
});

Template.searchUsersForm.events({
	'submit #user-search': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		var controller = Router.current();
		var searchObject = Bisia.Form.getFields($target);
		return controller.state.set('searchObject', searchObject);
	}
});