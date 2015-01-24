Template.fieldError.helpers({
	errorIcon: function(field) {
		var errors = Session.get('formErrors');
		// No icons at startup
		if (!Bisia.has(errors)) return '';
		// return !!errors[field] ? 'fail' : 'valid';
		if (errors[field]) return 'fail';
	},
	successIcon: function(field) {
		var success = Session.get('formSuccess');
		// No icons at startup
		if (!Bisia.has(success)) return '';
		// Valid if is a success field
		if (Bisia.has(success[field])) return 'valid';
	},
	errorMessage: function(field) {
		return Session.get('formErrors')[field];
	},
	successMessage: function(field) {
		return Session.get('formSuccess')[field];
	}
});