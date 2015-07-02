
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
	 * Partial templates
	 * @type {Object}
	 */
	mailTemplates: {
		layout: 'mail/layout_tpl.html',
		sponsors: 'mail/sponsors_tpl.html',
		footer: 'mail/footer_tpl.html'
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
	 * Compile and return partials
	 * @return {Object}
	 */
	getSponsorFooter: function() {
		SSR.compileTemplate('sponsorsTpl', Assets.getText(this.mailTemplates.sponsors));
		SSR.compileTemplate('footerTpl', Assets.getText(this.mailTemplates.footer));

		var helpers = {
			year: moment().format('YYYY')
		};

		return {
			sponsors: SSR.render('sponsorsTpl'),
			footer: SSR.render('footerTpl', helpers)
		};
	},

	/**
	 * Get the compiled mail template
	 * @param  {String} tpl
	 * @param  {Object} data
	 * @return {String}
	 */
	getMailTemplate: function(tpl, data) {
		// get precompiled partials
		var templates = this.getSponsorFooter();
		// compile the content template
		SSR.compileTemplate(tpl, Assets.getText('mail/'+tpl+'.html'));
		// extend partials with content
		var partials = _.extend(templates, {
			content: SSR.render(tpl, data),
			logoUrl: Meteor.absoluteUrl('img/logo_bisia_mail.svg')
		});
		// compile layout
		SSR.compileTemplate('layoutTpl', Assets.getText(this.mailTemplates.layout));
		// return rendered layout
		return SSR.render('layoutTpl', partials);
	},

	/**
	 * Set settings for email account
	 * @return {Void}
	 */
	mailSettings: function() {
		this.Tpl.siteName 	= "Bisiacaria.com";
		this.Tpl.from 		= "Bisiacaria.com <bisiacaria@gmail.com>";
	},

	/**
	 * Send notification email
	 * @param  {Object} emailObj
	 * @return {Void}          [description]
	 */
	sendNotificationMail: function(emailObj) {
		var data = _.pick(emailObj, 'message', 'username');
		data.createdAt = moment(emailObj.createdAt).format('dddd DD MMMM [alle] HH:mm');
		if (emailObj._id && emailObj.email && data.message) {
			Email.send({
				from: this.Tpl.from,
				to: emailObj.email,
				subject: 'Hai ricevuto una notifica su Bisia!',
				html: this.getMailTemplate('notificationTpl', data)
			});
			Emails.remove(emailObj._id);
		}
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

	/**
	 * Mail di reset pawwrod
	 * @return {String}
	 */
	resetPasswordBody: function() {
		var parent = this;
		this.Tpl.resetPassword.html = function(user, url) {
			var data = {
				url: url.replace('/#', '')
			};
			return parent.getMailTemplate('resetPasswordTpl', data);
		};
	},

	/**
	 * Mail di verifica indirizzo email
	 * @return {String}
	 */
	verifyEmailBody: function() {
		var parent = this;
		this.Tpl.verifyEmail.html = function(user, url) {
			var data = {
				url: url.replace('#/verify-email', 'conferma-email')
			};
			return parent.getMailTemplate('verifyEmailTpl', data);
		};
	}

};