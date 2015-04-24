
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
	 * Geocode object by Esri
	 * @type {Object}
	 */
	geocode: null,

	/**
	 * Textual reverse geo location
	 * @type {String}
	 */
	geoLocation: null,

	/**
	 * Map owner username
	 * @type {String}
	 */
	owner: null,

	/**
	 * Your actual position
	 * @type {Array}
	 */
	yourLatLng: null,

	/**
	 * Geocoder location
	 * @type {String}
	 */
	yourLocation: null,

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
	init: function(geocoder) {
		L.Icon.Default.imagePath = Meteor.absoluteUrl('packages/leaflet/images');
		this.map = L.map(this.wrapper, this.settings);
		L.tileLayer.provider('OpenMapSurfer.Roads').addTo(this.map);
		if (geocoder) this.initGeocode();
		return this;
	},

	/**
	 * Init the geocode object
	 * @return {Void}
	 */
	initGeocode: function() {
		this.geocode = new L.esri.Geocoding.Services.Geocoding();
	},

	/**
	 * Set map and marker to actual gps position
	 * @return {Void}
	 */
	backToYourPosition: function() {
		this.setView(this.yourLatLng, this.zoom);
		this.marker.setLatLng(this.yourLatLng);
	},

	/**
	 * Create a Map Object
	 * @param  {Object} positionObj
	 * @param  {Integer} zoom
	 * @return {Object}
	 */
	getCenterMap: function(posObj, zoom) {
		this.yourLocation = posObj.loc;
		return L.latLng(posObj.lat, posObj.lng);
	},

	/**
	 * Click the green button to set position
	 */
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
		if (this.geoLocation) {
			var location = $('<input/>', {type: 'hidden', name: 'location', value: this.geoLocation, id: 'location'});
			this.$mapButton.parent('form').append(location);
			var p = $('<p/>', {'class': 'geo-location'}).html(this.geoLocation);
			this.$mapButton.before(p).fadeIn();
		}
		Bisia.Ui.unsetReactive('map');
	},

	/**
	 * Click the remove position button
	 * @return {Void}
	 */
	removeMapPosition: function() {
		if (this.$mapButton) {
			Bisia.log('removeMapPosition', this.$mapButton);
			this.$mapButton.attr('data-action', 'add');
			this.$mapButton.find('i').toggleClass('fa-times fa-globe');
			this.$mapButton.find('span').html('Posizione sulla mappa');
			this.$mapButton.parent('form').find('#position-lat').remove();
			this.$mapButton.parent('form').find('#position-lng').remove();
			this.$mapButton.parent('form').find('#location').remove();
			this.$mapButton.prev('p').fadeOut().remove();
		}
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
	 * @param  {Bool} geocoder
	 * @return {Void}
	 */
	triggerMapCreation: function(wrapper, geocoder) {
		var parent = this;
		var position = arguments[2] ? arguments[2] : null;
		geocoder = geocoder || false;
		this.wrapper = wrapper;

		Bisia.Ui.setReactive('map', {
			wrapper: this.wrapper,
			commands: geocoder
		});

		Meteor.setTimeout(function() {
			parent.init(geocoder)					// Init the map
				  .yourPosition(position)			// Find your position and triggers onPositionFound
				  .listenPositionClick(geocoder);			// Listen for clicks on the map
		}, 500);
	},

	/**
	 * Triggers the click position on the map
	 * @returns {Bisia.Map}
	 */
	listenPositionClick: function(geocoder) {
		if (geocoder)
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
	yourPosition: function(position) {
		if (position) {
			var mapObj = this.getCenterMap(position);
			this.map.setView(mapObj, this.zoom);
			this.setGeoPosition(mapObj, this.zoom);
		} else {
			this.owner = null;
			this.yourLocation = null;
			this.map.locate({ setView: true, maxZoom: this.zoom });
			this.map.on('locationfound', this.onPositionFound);
		}
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
			if (Bisia.Map.geocode) {
				Bisia.Map.geocode.reverse().latlng(e.latlng).run(function(error, result) {
					if (! error) {
						Bisia.Map.clickLatLng = e.latlng;
						Bisia.Map.geoLocation = result.address.Match_addr;
						Bisia.Map.marker.setLatLng(Bisia.Map.clickLatLng).update();
					}
				});
			} else {
				Bisia.Map.clickLatLng = e.latlng;
				Bisia.Map.marker.setLatLng(Bisia.Map.clickLatLng).update();
			}
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
		Bisia.Map.setGeoPosition(position, radius);
	},

	/**
	 * Set Geo position
	 * @param  {Object} position
	 * @param  {Int} radius
	 * @return {Void}
	 */
	setGeoPosition: function(position, radius) {
		if (Bisia.Map.geocode) {
			this.geocode.reverse().latlng(position).run(function(error, result) {
				Bisia.Map.geoLocation = result.address.Match_addr;
				Bisia.Map.marker = L.marker(position).addTo(Bisia.Map.map).bindPopup(result.address.Match_addr).openPopup();
			});
		} else {
			var location = Bisia.Map.yourLocation || 'Ti trovi qui!';
			if (Bisia.Map.owner) {
				location = "<span>" + Bisia.Map.owner + " era qui:</span>" + location;
			}
			Bisia.Map.marker = L.marker(position).addTo(Bisia.Map.map).bindPopup(location).openPopup();
		}
		if (radius) {
			Bisia.Map.circle = L.circle(position, radius).addTo(Bisia.Map.map);
		}
	}

};