
// Bisia Namespace

Bisia.Mail = {

	/*smtp: {
		username: 'bisiacaria@gmail.com',
		password: 'for30pulses',
		server:   'smtp.gmail.com',
		port: 465
	},*/

	smtp: Meteor.settings.mail.smtp,

	/**
	 * Accounts.emailTemplates alias
	 * @type {Object}
	 */
	Tpl: Accounts.emailTemplates,

	/**
	 * Build the smtp MAIL_URL string
	 * @return {String}
	 */
	buildMailUrl: function() {
		return 'smtp://' + encodeURIComponent(this.smtp.username) + ':' +
						   encodeURIComponent(this.smtp.password) + '@' +
						   encodeURIComponent(this.smtp.server) + ':' +
						   this.smtp.port;
	},

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		// Set MAIL_URL
		process.env.MAIL_URL = this.buildMailUrl();
		// Settings
		this.mailSettings();
		// ResetPassword
		this.setSubject("resetPassword", "Imposta una nuova password per il tuo account");
		this.resetPasswordBody();

		// verifyEmail
		this.setSubject("verifyEmail", "Conferma l'indirizzo e-mail dell'account");
		this.verifyEmailBody();
		// Bisia.log(this.Tpl);
	},

	/**
	 * Set settings for email account
	 * @return {Void}
	 */
	mailSettings: function() {
		this.Tpl.siteName 	= "Bisiacaria.com";
		this.Tpl.from 		= "Bisiacaria.com <noreply@bisiacaria.com>";
	},

	/**
	 * Set a subject for a mail
	 * @param {String}
	 * @param {String}
	 * @return {Object}
	 */
	setSubject: function(obj, subject) {
		this.Tpl[obj].subject = function(user) {
			return subject;
		};
	},




	resetPasswordBody: function() {
		this.Tpl.resetPassword.html = function(user, url) {
			url = url.replace('/#', '');
			return "Clicca questo link per poter impostare una nuova password:<br><br>" + url;
		};
	},

	verifyEmailBody: function() {
		this.Tpl.verifyEmail.html = function(user, url) {
			url = url.replace('#/verify-email', 'conferma-email');
			return "Clicca questo link per confermare l'indirizzo e-mail:<br><br>" + url;
		};
	},

};