
// Log

Bisia.Log = {

	basePath: null,

	winston: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		this.winston = Winston;
		// this.basePath = process.env.PWD + '/tests/logs';
		this.basePath = Meteor.settings.log.basePath;

		// Add File transport
		this.winston.add(this.winston.transports.DailyRotateFile, {
			datePattern: '.yyyy-MM-dd',
			dirname: this.basePath,
			filename: 'bisiacaria'
		});
	},

	/**
	 * [info description]
	 * @param  {[type]} msg [description]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	info: function(msg, obj) {
		var extObj = _.extend(obj, {
			IP: Meteor.call('getIp'),
			UID: Meteor.userId()
		});

		return this.winston.info(msg, extObj);
	},

    /**
     *
     * @param msg
     * @param obj
     * @returns {*|any|{code, message}}
     */
    error: function(msg, obj) {
        return this.winston.error(msg, obj);
    },

	/**
	 * [server description]
	 * @param  {[type]} msg [description]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	server: function(msg, obj) {
		return this.winston.info(msg, obj);
	}

};