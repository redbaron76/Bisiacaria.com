Template.privacyPolicyModal.helpers({
	iubendaPolicy: function() {
		HTTP.get('http://www.iubenda.com/api/privacy-policy/619298/no-markup', function(error, result) {
			if (result && result.data.content) {
				var content = result.data.content;
				Session.set('policy', content);
			}
		});
		return Session.get('policy');
	}
});

Template.cookieAdvice.events({
	'click .close': function(e, t) {
		e.preventDefault();
		$('#cookie-advice').slideUp('fast');
	}
})