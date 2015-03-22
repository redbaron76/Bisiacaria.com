
// Map

Bisia.Map = {

	map: null,

	marker: null,

	circle: null,

	wrapper: 'map-wrapper',

	genericLatLng: [45.81133, 13.51404],

	positionLatLng: null,

	settings: {
		doubleClickZoom: false
	},

	zoom: 16,

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

	centerMapPosition: function() {
		this.map.setZoom(this.zoom);
		this.setView(this.positionLatLng);
		this.marker.setLatLng(this.positionLatLng).update();
	},

	onClickPosition: function(e) {
		Bisia.Map.marker.setLatLng(e.latlng).update();
	},

	/**
	 * Callback on position found
	 * @param  {Object} e position object
	 * @return {Void}
	 */
	onPositionFound: function(e) {
		var radius = e.accuracy / 2;
		Bisia.Map.positionLatLng = e.latlng;
		Bisia.Map.marker = L.marker(Bisia.Map.positionLatLng).addTo(Bisia.Map.map)
						.bindPopup('Ti trovi qui!')
						.openPopup();

		Bisia.Map.circle = L.circle(Bisia.Map.positionLatLng, radius).addTo(Bisia.Map.map);
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
			parent.init().yourPosition().setPosition();
		}, 500);
	},

	setPosition: function() {
		this.map.on('click', this.onClickPosition);
		return this;
	},

	/**
	 * Set map on your actual gps position
	 * @return {Bisia.Map}
	 */
	yourPosition: function() {
		this.map.locate({ setView: true, maxZoom: this.zoom });
		this.map.on('locationfound', this.onPositionFound);
		return this;
	}
	
};