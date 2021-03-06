
// Login

Bisia.Login = {

	/**
	 * Flag true when forced to logout
	 * @type {Boolean}
	 */
	forcedOut: false,

	messages: {
		loginTitleFail: "Login non riuscito!",
		facebookEmailExist: "L'indirizzo e-mail del tuo account Facebook è già in uso su Bisiacaria.com e non può essere utilizzato per la registrazione di un nuovo utente.",
		facebookConnection: "Errore nel collegamento con Facebook, riprovare!",
		loginFormFail: "Il tuo login non è andato a buon fine!<br>Controlla i parametri immessi e riprova.",
		emailNotPresent: "Questo indirizzo e-mail non risulta appartenere a nessun utente di Bisiacaria.com",
		passwordRecovered: "Ti abbiamo inviato una mail contenente un link che dovrai cliccare per impostare una nuova password da associare al tuo account su Bisiacaria.com",
		passwordNotSet: "Non è stato possibile impostare una nuova password.",
		emailInUse: "L'indirizzo e-mail da te inserito è già in uso su Bisiacaria.com",
		nicknameInUse: "Il nickname da te scelto appartiene già ad un altro utente di Bisiacaria.com",
		nicknameReserved: "Il nickname da te scelto è riservato e non può essere impostato.",
		unableVerifyEmail: "Il link sul quale hai cliccato per verificare il tuo account è scaduto e non è più utilizzabile.",
	},

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Check if User is already logged
	 * and redirect to Home Page if so
	 * @return {Void}
	 */
	alreadyLogged: function() {
	},

	/**
	 * Login and redirect when it"s everything OK
	 * @param  {String} method
	 * @param  {String} service
	 * @return {Void}
	 */
	assertLogin: function(method, service) {
		var parent = this;
		var login = {
			"userId": Meteor.userId(),
			"service": service
		};
		this.forcedOut = true;
		Meteor.call(method, login, function(error, result) {
			if (result) {
				Router.go("homePage");
				parent.forcedOut = false;
			}
			if (error) {
				if (service == 'facebook') {
					if (error.reason) {
						parent.failLogin("facebookConnection", error.reason);
					} else {
						parent.failLogin("facebookConnection");
					}
				} else {
					parent.failLogin("loginFormFail", parent.messages.loginTitleFail);
				}
			}
		});
	},

	basicAuthProtect: function() {
		this.config = Meteor.settings.login;
		if (this.config.basicAuthEnabled) {
			var basicAuth = new HttpBasicAuth(this.config.username, this.config.password);
			basicAuth.protect();
		}
	},

	sitePreviewLogin: function() {
		this.forcedOut = true;
		Meteor.logout(function() {
			Bisia.User.alreadyInit = false;
			Router.go("confirmEmail");
		});
	},

	/**
	 * Triggered when login fails
	 * @param  {Object} errorObj
	 * @return {Bool}
	 */
	failLogin: function(message) {
		var text = arguments[1] || this.messages[message];
		var title = arguments[2] || this.messages.loginTitleFail;
		Bisia.Ui.submitError(text, title);
		return false;
	},

	/**
	 * Cursor to check if user is online
	 * @return {Void}
	 */
	forceUnlogged: function() {
		if (Bisia.Session.offlineProfile() && !Bisia.Login.forcedOut) {
			Meteor.logout(function() {
				Bisia.User.alreadyInit = false;
				Bisia.Ui.toggleSidebar();
				Router.go("loginUser");
			});
		}
	},

	forceLogin: function() {
		if (Bisia.Session.offlineProfile()) {
			Bisia.User.alreadyInit = false;
			Bisia.Ui.toggleSidebar();
			Router.go("loginUser");
		}
	},

	/**
	 * [forceLoginPage description]
	 * @return {[type]} [description]
	 */
	forceLoginPage: function() {
		if (Bisia.Session.offlineProfile()) {
			Meteor.logout(function() {
				Bisia.User.alreadyInit = false;
				Bisia.Ui.toggleSidebar();
				Router.go("loginUser");
			});
		}
	},

	/**
	 * Check if route requires login
	 * @return {Void}
	 */
	requireLogin: function() {

		// Stop if offline
		if ( ! Bisia.Session.connStatus.get()) {
			this.redirect("/");
		}

		if (! Bisia.User.isLogged()) {
			if (Meteor.loggingIn()) {
				this.render(this.loadingTemplate);
			} else {
				this.redirect("/login");
			}
		} else {
			this.next();
		}
	},
};