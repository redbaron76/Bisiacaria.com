
// Login

Bisia.Login = {

	/**
	 * Flag true when forced to logout
	 * @type {Boolean}
	 */
	forcedOut: false,

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
	 * Cursor to check if user is online
	 * @return {Void}
	 */
	forceUnlogged: function() {		
		if (Bisia.User.offlineProfile() && !Bisia.Login.forcedOut) {
			Meteor.logout(function() {
				Router.go('loginUser');
			});
		}
	},

	/**
	 * Check if route requires login
	 * @return {Void}
	 */
	requireLogin: function() {
		if(! Bisia.User.isLogged()) {
			if(Meteor.loggingIn()) {
				this.render(this.loadingTemplate);
			} else {
				this.redirect('/login');
			}
		} else {
			this.next();
		}
	},
};