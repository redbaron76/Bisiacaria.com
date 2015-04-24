Template.infoClose.events({
	'click #info-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('info');
	}
});

Template.categoryItem.events({
	'click span': function(e, t) {
		e.preventDefault();
		var text = $(e.target).html();
		$('input#category').val('').val(text);
		Bisia.Ui.unsetReactive('info');
	},
	'click .fa-trash': function(e, t) {
		e.preventDefault();
		var $li = $(e.target).parent('li');
		var text = $li.find('span').html();
		Users.update({_id: Meteor.userId()}, { $pull: {'profile.categories': text} });
		$li.fadeOut('slow').remove();
	}
});

Template.infoConfirm.events({
	'click #confirm-no': function(e, t) {
		e.preventDefault();
		$('#info-close').trigger('click');
	},
	'click #confirm-yes': function(e, t) {
		e.preventDefault();
		Bisia.executeFunctionByName(this.method, window, this.event, this.context);
		Bisia.Ui.unsetReactive('info');
	}
});