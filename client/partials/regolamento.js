Template.regolamento.helpers({
	minAllowedAge: function() {
		return Meteor.settings.public.rules.minAllowedAge;
	}
});