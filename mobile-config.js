App.info({
	id: 'com.bisiacaria.fabio.fumis',
	name: 'Bisiacaria.com',
	description: 'Il social network dei bisiachi.',
	author: 'Fabio Fumis',
	email: 'bisiacaria@gmail.com',
	website: 'http://bisiacaria.com'
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#f4a816');
App.setPreference('StatusBarStyle', 'lightcontent');

App.accessRule('*');
App.accessRule('http://*.cloudinary.com/*');
App.accessRule('http://openmapsurfer.uni-hd.de/tiles/*');

App.configurePlugin('com.phonegap.plugins.facebookconnect', {
	APP_ID: '301870346508580',
	API_KEY: 'a725aa9a06b29df85a616a6d6cf64c45'
});