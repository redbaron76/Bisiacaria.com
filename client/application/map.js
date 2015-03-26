
// Map

Bisia.Map = {

	/**
	 * The map layer
	 * @type {Object}
	 */
	map: null,

	/**
	 * The marker layer
	 * @type {Object}
	 */
	marker: null,

	/**
	 * The circle layer
	 * @type {Object}
	 */
	circle: null,

	/**
	 * Your actual position
	 * @type {Array}
	 */
	yourLatLng: null,

	/**
	 * Clicked position on map
	 * @type {Array}
	 */
	clickLatLng: null,

	/**
	 * Generic position in Bisiacaria
	 * @type {Array}
	 */
	genericLatLng: [45.81133, 13.51404],

	/**
	 * Global settings for map object
	 * @type {Object}
	 */
	settings: {
		doubleClickZoom: false
	},

	/**
	 * Default zoom level
	 * @type {Number}
	 */
	zoom: 16,

	/**
	 * The map container
	 * @type {String}
	 */
	wrapper: 'map-wrapper',

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		L.Icon.Default.imagePath = 'packages/leaflet/images';
		this.map = L.map(this.wrapper, this.settings);
		L.tileLayer.provider('OpenMapSurfer.Roads').addTo(this.map);
		return this;
	},

	/**
	 * Set map and marker to actual gps position
	 * @return {Void}
	 */
	backToYourPosition: function() {
		this.setView(this.yourLatLng, this.zoom);
		this.marker.setLatLng(this.yourLatLng);
	},

	setMapPosition: function() {
		var position = this.clickLatLng;
		this.$mapButton = $('#map-position');
		this.$mapButton.attr('data-action', 'remove');
		this.$mapButton.find('i').toggleClass('fa-globe fa-times');
		this.$mapButton.find('span').html('Rimuovi la posizione');
		var lat = $('<input/>', {type: 'hidden', name: 'lat', value: position.lat, id: 'position-lat'});
		var lng = $('<input/>', {type: 'hidden', name: 'lng', value: position.lng, id: 'position-lng'});
		this.$mapButton.parent('form').append(lat);
		this.$mapButton.parent('form').append(lng);
		Bisia.Ui.unsetReactive('map');
	},

	removeMapPosition: function() {
		this.$mapButton.attr('data-action', 'add');
		this.$mapButton.find('i').toggleClass('fa-times fa-globe');
		this.$mapButton.find('span').html('Posizione sulla mappa');
		this.$mapButton.parent('form').find('#position-lat').remove();
		this.$mapButton.parent('form').find('#position-lng').remove();
	},

	/**
	 * Set map view
	 * @param {Array} latLng
	 * @param {Int} zoom   zomm level
	 * @return {Bisia.Map}
	 */
	setView: function(latLng, zoom) {
		this.map.setView(latLng, zoom);
		return this;
	},

	/**
	 * Initialize a map object on trigger
	 * @param  {String} wrapper
	 * @return {Void}
	 */
	triggerMapCreation: function(wrapper) {
		var parent = this;
		this.wrapper = wrapper;

		Bisia.Ui.setReactive('map', {
			wrapper: this.wrapper
		});
		
		Meteor.setTimeout(function() {
			parent.init()					// Init the map
				  .yourPosition()			// Find your position and triggers onPositionFound
				  .listenPositionClick();	// Listen for clicks on the map
		}, 500);
	},

	/**
	 * Triggers the click position on the map
	 * @returns {Bisia.Map}
	 */
	listenPositionClick: function() {
		this.map.on('click', this.onClickPosition);
		return this;
	},

	listenPositionOff: function() {
		this.map.off('click', this.onClickPosition);
		return this;
	},

	/**
	 * Finds your actual gps position
	 * @return {Bisia.Map}
	 */
	yourPosition: function() {
		this.map.locate({ setView: true, maxZoom: this.zoom });
		this.map.on('locationfound', this.onPositionFound);
		return this;
	},

	/**
	 * Callback on click position to the map
	 * @param  {Object} e
	 * @return {Void}
	 */
	onClickPosition: function(e) {
		var target = e.originalEvent.target.toString();
		if (target == "[object SVGSVGElement]") {
			Bisia.Map.clickLatLng = e.latlng
			Bisia.Map.marker.setLatLng(Bisia.Map.clickLatLng).update();	
		}		
	},

	/**
	 * Callback on position found
	 * @param  {Object} e position object
	 * @return {Void}
	 */
	onPositionFound: function(e) {
		var radius = e.accuracy / 2;
		var position = e.latlng;
		Bisia.Map.clickLatLng = position;
		Bisia.Map.yourLatLng = position;
		Bisia.Map.marker = L.marker(position).addTo(Bisia.Map.map)
											 .bindPopup('Ti trovi qui!')
											 .openPopup();

		Bisia.Map.circle = L.circle(position, radius).addTo(Bisia.Map.map);
	}
	
};