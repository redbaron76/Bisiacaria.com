
Bisia.Mail = {

    /*smtp: {
     username: 'bisiacaria@gmail.com',
     password: 'for30pulses',
     server:   'smtp.gmail.com',
     port: 465
     },*/

    smtp: Meteor.settings.mail.smtp,

    mailgun: Meteor.settings.mail.mailgun,

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
        var removeLayout = arguments[2] || false;
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
        // DOCTYPE
        var doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

        if (removeLayout) {
            // return rendered tpl
            return doctype + SSR.render(tpl, data);
        } else {
            // return rendered layout
            return doctype + SSR.render('layoutTpl', partials);
        }
    },

    /**
     * Set settings for email account
     * @return {Void}
     */
    mailSettings: function() {
        this.Tpl.siteName 	= "Bisiacaria.com";
        this.Tpl.from 		= "Bisiacaria.com <bisiacaria@gmail.com>";

        Meteor.Mailgun.config({
            username: this.mailgun.username,
            password: this.mailgun.password
        });
    },

    /**
     * Send notification email
     * @param  {Object} emailObj
     * @return {Void}          [description]
     */
    sendNotificationMail: function(emailObj) {
        var data = {
            newMessages: 0,
            lastNews: 0,
            newVisits: 0,
            newVotes: 0,
            newFriends: 0,
            noData: false
        };

        var noties = Notifications.find({
            'targetId': emailObj.targetId,
            'isBroadcasted': true,
            'isRead': false,
            '$or': [
                { 'action': 'message' },
                { 'action': 'visit' },
                { 'action': 'friend' },
                { 'action': 'vote' },
                { 'action': 'note', 'actionKey': 'post' }
            ]
        });


        if (emailObj.email && noties.count() > 0) {

            noties.forEach(function(noty) {
                switch (noty.action) {
                    case 'message':
                        data.newMessages ++;
                        break;
                    case 'note':
                        data.lastNews ++;
                        break;
                    case 'visit':
                        data.newVisits ++;
                        break;
                    case 'votes':
                        data.newVotes ++;
                        break;
                    case 'friend':
                        data.newFriends ++;
                        break;
                }
            });

            // Set no data message
            if (data.newMessages == 0 && data.lastNews == 0 && data.newVisits == 0 && data.newVotes == 0 && data.newFriends == 0) {
                data.noData = true;
            }

            /*Email.send({
             from: this.Tpl.from,
             to: emailObj.email,
             subject: 'Le tue notifiche su Bisia!',
             html: this.getMailTemplate('notificationTpl', data)
             });*/

            Meteor.call('sendEmail', {
                from: this.Tpl.from,
                to: emailObj.email,
                subject: 'Hai nuove notifiche su Bisia!',
                text: '',
                html: this.getMailTemplate('notificationTpl', data)
            });

            // console.log('to: ' + emailObj.email, data);
        }

        // Remove email queued
        Emails.remove(emailObj._id);
    },

    /**
     * Email users not logged in since 15 days
     * @param  {Obj} userObj
     * @return {Void}
     */
    sendYouMissFromBisia: function(userObj) {
        var today = moment();
        var data = {};
        data.nickname = userObj.username;
        data.email = userObj.emails[0].address;
        data.passDays = today.diff(userObj.profile.loginSince, 'days');

        Meteor.call('sendEmail', {
            from: this.Tpl.from,
            to: data.email,
            subject: 'Nuovi utenti ti aspettano su Bisia!',
            text: '',
            html: this.getMailTemplate('youMissFromBisiaTpl', data)
        });
    },

    sendToOldUsers: function() {
        var parent = this;
        var config = Meteor.settings.mail.olduser;

        if (config.enableTest) {
            var oldUsers = OldUsers.find({nickname: 'redbaron76'});
        } else {
            var oldUsers = OldUsers.find();
        }

        var data, count = 0, err = [];
        var users = oldUsers.fetch();

        if (config.enableOldUsers) {

            var startDate = moment();
            console.log('Start at ' + startDate.toDate() + ' with emails: ' + users.length);

            _.each(users, function(user, index) {

                if (index >= config.startFromIndex) {

                    data = {
                        email: user['email'],
                        nickname: user['nickname'],
                        unsubscribe: Meteor.absoluteUrl('unsubscribe/' + user['id'])
                    };

                    // [46.101.31.74] invio a Harris con mail muletamp@yahoo.it - count: 421[46.101.31.74]
                    try {

                        Meteor.call('sendEmail', {
                            from: Bisia.Mail.Tpl.from,
                            to: user['email'],
                            subject: config.mailSubject,
                            text: '',
                            html: parent.getMailTemplate(config.mailTpl, data, true)    // true = removeLayout
                        });

                    } catch (err) {
                        err.push(user['email']);
                        console.log('Errore invio verso: ' + user['email']);
                        Bisia.Log.error('Errore invio verso: ' + user['email'], {});
                    }

                    count++;

                    console.log('invio a ' + user['nickname'] + ' con mail ' + user['email'] + ' - count: ' + count);

                    if (count % config.emailsAndStop == 0) {
                        console.log('stop');
                        Meteor._sleepForMs(config.timeOut);
                    }

                    if (count == users.length) {
                        Bisia.Log.info('Mail non valide:', err);
                        console.log('Tempo impiegato: ' + startDate.diff(moment(), 'minutes'));
                    }

                }

            });

        }

    },

// Bisia Namespace

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

Meteor.methods({
	sendEmail: function (mailFields) {
		// console.log("about to send email...");
		check([mailFields.to, mailFields.from, mailFields.subject, mailFields.text, mailFields.html], [String]);

		// Let other method calls from the same client start running,
		// without waiting for the email sending to complete.
		this.unblock();

        try {
            Meteor.Mailgun.send({
                to: mailFields.to,
                from: mailFields.from,
                subject: mailFields.subject,
                text: mailFields.text,
                html: mailFields.html
            });
        } catch(err) {
            Bisia.Log.error('Errore invio mail', err)
        }

		// console.log("email sent!");
	}
});