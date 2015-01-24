
// Login

Bisia.Login = {

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
		if(Bisia.User.isLogged()) {
			this.render('homePage');
		} else {
			this.next();
		}
	},

	requireLogin: function() {
		if(! Bisia.User.isLogged()) {
			if(Meteor.loggingIn()) {
				this.render(this.loadingTemplate);
			} else {
				this.render('loginUser');
			}
		} else {
			this.next();
		}
	},
};