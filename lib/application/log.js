
// Log

Bisia.Log = {

	winston: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		this.winston = Winston;
	},

	info: function() {
		return this.winston.info(arguments);
	}


};