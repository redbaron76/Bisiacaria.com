
// Config
// Init by /server/commons/startup.js

Bisia.Config = {

	/**
	 * ServiceConfiguration Alias
	 * @type {Object}
	 */
	Service: ServiceConfiguration.configurations,

	/**
	 * Meteor.settings Alias
	 * @type {Object}
	 */
	Settings: Meteor.settings,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		Bisia.log('init Bisia.Config');
		this.setSettings('facebook');
	},

	/**
	 * Get settings from settings.json using Meteor.settings
	 * @param  {String} key
	 * @return {Object}
	 */
	getSettings: function(key) {
		return this.Settings[key];
	},

	/**
	 * Remove previous configuration - reset service settings
	 * @param  {String} service
	 * @return {Void}
	 */
	removeSettings: function(service) {
		this.Service.remove({
			service: service
		});
	},

	/**
	 * Set a service settings
	 * @param {String} key
	 */
	setSettings: function(key) {
		var settingsObj = this.getSettings(key);
		this.removeSettings(settingsObj.service);
		this.Service.insert(settingsObj);
	},
};