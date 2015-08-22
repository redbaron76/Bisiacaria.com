
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
	 * position object of the owner
	 * @type {Object}
	 */
	ownerPosition: null,

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
	 * GeoTag when set
	 * Set in user.js
	 * @type {String}
	 */
	myPosition: null,

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
	 * subscription handler
	 */
	nearPlaces: null,

	/**
	 * Save position on press button green
	 * @type {Boolean}
	 */
	saveOnSet: false,

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
	 * Layer from markers of users
	 * @type {[type]}
	 */
	markersLayer: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function(geocoder) {
		L.Map = this.mapCreate();
		L.Icon.Default.imagePath = Meteor.absoluteUrl('packages/leaflet/images');
		this.map = new L.Map(this.wrapper, this.settings);
		L.tileLayer.provider('OpenMapSurfer.Roads').addTo(this.map);
		if (geocoder) this.initGeocode();
		return this;
	},

	mapCreate: function() {
		return L.Map.extend({
			openPopup: function(popup) {
				//  this.closePopup();
				this._popup = popup;

				return this.addLayer(popup).fire('popupopen', {
					popup: this._popup
				});
			}
		});
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
	 * Get distance in meters between 2 points
	 * @param  {Float} oLat
	 * @param  {Float} oLng
	 * @return {Int}
	 */
	distInMeters: function(oLat, oLng) {
		var oLatLng = L.latLng(oLat, oLng);
		return L.latLng(this.clickLatLng).distanceTo(oLatLng);
	},

	/**
	 * Create a Map Object
	 * @param  {Object} positionObj
	 * @param  {Integer} zoom
	 * @return {Object}
	 */
	getCenterMap: function(posObj, zoom) {
		return L.latLng(posObj.lat, posObj.lng);
	},

	/**
	 * Get published places
	 * @param  {Int} limit
	 * @return {Mongo.Cursor}
	 */
	getNearPlaces: function(distance, limit) {
		var lat = this.clickLatLng.lat;
		var lng = this.clickLatLng.lng;
		var max = distance || 100;

		var places = Places.find({
			'loc': {
				'$near': [ parseFloat(lat), parseFloat(lng) ],
				'$maxDistance': max
			}
		}, {
			'limit': limit
		});
		return places;
	},

	/**
	 * Click the green button to set position
	 */
	setMapPosition: function() {
		var position = this.clickLatLng;

		if (this.saveOnSet) {

			// Add geoLocation to position if present
			if (this.geoLocation) {
				position = _.extend(position, {
					location: this.geoLocation
				});
			}
			// Load places if any
			var places = Bisia.Map.getNearPlaces(100, 10);
			if (places.count() > 0) {
				Meteor.setTimeout(function() {
					Bisia.Ui.setReactive('info', {
						template: 'geotagList',
						geotags: places,
						position: position,
						saveFly: true
					});
				}, 500);
			} else {
				this.saveFlyPosition(position);
			}

		} else {

			var hiddenInputs = {};
			this.$mapButton = $('#map-position');
			this.$mapButton.attr('data-action', 'remove');
			this.$mapButton.find('i').toggleClass('fa-globe fa-times');
			this.$mapButton.find('span').html('Rimuovi la posizione');
			var $mapForm = this.$mapButton.parent('form');

			this.$mapButton.next('.form-group').find('.show-categories').hide()
			this.$mapButton.next('.form-group').find('.show-geotags').css({display: 'table-cell'});
			// add elements to tmp object
			hiddenInputs.lat = $('<input/>', {type: 'hidden', name: 'lat', value: position.lat, id: 'position-lat'});
			hiddenInputs.lng = $('<input/>', {type: 'hidden', name: 'lng', value: position.lng, id: 'position-lng'});
			if (this.geoLocation) {
				hiddenInputs.location = $('<input/>', {type: 'hidden', name: 'location', value: this.geoLocation, id: 'location'});
				var $p = $('<p/>', {'class': 'geo-location'}).html(this.geoLocation);
				if ($('.geo-location').length == 0) this.$mapButton.before($p).fadeIn();
			}

			// Append elements to form
			_.each(hiddenInputs, function($el) {
				if (! jQuery.contains(document, $el[0])) {
					$mapForm.append($el);
				}
			});

			// Load places if any
			var places = Bisia.Map.getNearPlaces(100, 10);
			if (places.count() > 0) {
				Meteor.setTimeout(function() {
					Bisia.Ui.setReactive('info', {
						template: 'geotagList',
						geotags: places,
						saveFly: false
					});
				}, 500);
			} else {
				// Close map
				Bisia.Ui.unsetReactive('map');
			}
		}
	},

	/**
	 * Click the remove position button
	 * @return {Void}
	 */
	removeMapPosition: function() {
		if (this.$mapButton) {
			this.$mapButton.attr('data-action', 'add');
			this.$mapButton.find('i').toggleClass('fa-times fa-globe');
			this.$mapButton.find('span').html('Posizione sulla mappa');
			this.$mapButton.parent('form').find('#position-lat').remove();
			this.$mapButton.parent('form').find('#position-lng').remove();
			this.$mapButton.parent('form').find('#location').remove();
			this.$mapButton.parent('form').find('#tag-id').remove();
			this.$mapButton.prev('p').fadeOut().remove();
			this.$mapButton.next('.form-group').find('.show-geotags').hide()
			this.$mapButton.next('.form-group').find('.show-categories').css({display: 'table-cell'});
		}
	},

	/**
	 * Save the position on the fly
	 * @param  {Object} position
	 * @return {Vois}
	 */
	saveFlyPosition: function(position) {
		if (this.saveOnSet) {
			Meteor.call('saveFlyPosition', position, function (error, result) {
				if (result) {
					Bisia.Ui.unsetReactive('map');
					Bisia.Ui.unsetReactive('info');
					Meteor.setTimeout(function() {
						// record position to user.js
						Bisia.User.recordLastPosition(position);
						return Bisia.Ui.submitSuccess('La tua posizione è stata registrata con successo!', 'GeoTag inserito!', null, true);
					}, 500);
				}
			});
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
		geocoder = (geocoder) ? geocoder : false;
		var position = arguments[2] ? arguments[2] : null;
		this.saveOnSet = arguments[3] ? arguments[3] : false;
		var manageInstance = arguments[4] ? arguments[4] : false;
		this.wrapper = wrapper;

		Bisia.Ui.setReactive('map', {
			wrapper: this.wrapper,
			commands: geocoder,
			position: position,
			instance: manageInstance
		});

		Meteor.setTimeout(function() {
			parent.init(geocoder)					// Init the map
				  .yourPosition(position)			// Find your position and triggers onPositionFound
				  .listenPositionClick(geocoder);	// Listen for clicks on the map
				  //.listenPopupClose();
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

	listenPopupClose: function() {
		this.map.on('popupclose', this.onClosePopup);
		return this;
	},

	/**
	 * Finds your actual gps position
	 * @return {Bisia.Map}
	 */
	yourPosition: function(position) {
		if (position) {
			var mapObj = this.getCenterMap(position);
			this.geocode = null;
			this.ownerPosition = position;
			this.map.setView(mapObj, this.zoom);
			this.setGeoPosition(mapObj, this.zoom);
		} else {
			this.ownerPosition = null;
			this.map.locate({ setView: true, maxZoom: this.zoom });
			this.map.on('locationfound', this.onPositionFound);
			this.map.on('locationerror', this.tryCordovaGeolocation);
		}
		return this;
	},

	/**
	 * Close the radius circle on closing popup
	 * @return {[type]} [description]
	 */
	onClosePopup: function() {
		Bisia.Map.map.removeLayer(Bisia.Map.circle);
	},

	/**
	 * Callback on click position to the map
	 * @param  {Object} e
	 * @return {Void}
	 */
	onClickPosition: function(e) {
		var tmpLocation, target = e.originalEvent.target.toString();
		if (target == "[object SVGSVGElement]" || target == "[object HTMLImageElement]") {
			if (Bisia.Map.geocode) {
				Bisia.Map.geocode.reverse().latlng(e.latlng).run(function(error, result) {
					if (error) {
						tmpLocation = 'Posizione sconosciuta';
					} else {
						tmpLocation = result.address.Match_addr;
					}
					Bisia.Map.geoLocation = tmpLocation;
					Bisia.Map.clickLatLng = e.latlng;
					Bisia.Map.marker.setLatLng(Bisia.Map.clickLatLng).update();

					var popContent = '<span>Ti sei spostato qui:</span>' + tmpLocation;
					Bisia.Map.marker.setPopupContent(popContent).openPopup();
				});
			} else {
				Bisia.Map.clickLatLng = e.latlng;
				Bisia.Map.marker.setLatLng(Bisia.Map.clickLatLng).update();
			}

			// Stop nearPlaces
			if (Bisia.Map.nearPlaces) Bisia.Map.nearPlaces.stop();
			// Subscribe near locations
			Bisia.Map.nearPlaces = Meteor.subscribe('nearPlaces', e.latlng.lat, e.latlng.lng, 100);
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

		// Stop nearPlaces
		if (Bisia.Map.nearPlaces) Bisia.Map.nearPlaces.stop();
		// Subscribe near locations
		Bisia.Map.nearPlaces = Meteor.subscribe('nearPlaces', position.lat, position.lng, 100);
	},

	/**
	 * Get position by Cordova
	 * @return {Void}
	 */
	tryCordovaGeolocation: function() {
		navigator.geolocation.getCurrentPosition(Bisia.Map.onCordovaSuccess, Bisia.Map.onCordovaError);
	},

	/**
	 * Mimic onPositionFound on Cordova
	 * @param  {Object} position
	 * @return {Void}
	 */
	onCordovaSuccess: function(position) {
		if (position && position.position) {
			var lat = position.position.coords.latitude;
			var lng = position.position.coords.longitude;
			var radius = position.coords.accuracy / 2;
			var pos = L.latLng(lat, lng);

			Bisia.Map.clickLatLng = pos;
			Bisia.Map.yourLatLng = pos;
			Bisia.Map.setGeoPosition(pos, radius);
		}
	},

	/**
	 * On Cordova Error
	 * @param  {Object} error
	 * @return {Void}
	 */
	onCordovaError: function(error) {
		Bisia.log(error);
		alert('Impossibile rilevare la posizione!');
	},

	/**
	 * Set Geo position
	 * @param  {Object} position
	 * @param  {Int} radius
	 * @return {Void}
	 */
	setGeoPosition: function(position, radius) {
		var popup = this.getPopupContent();
		if (Bisia.Map.geocode) {
			this.geocode.reverse().latlng(position).run(function(error, result) {
				Bisia.Map.geoLocation = result.address.Match_addr;
				Bisia.Map.marker = L.marker(position).addTo(Bisia.Map.map).bindPopup(popup + result.address.Match_addr).openPopup();
			});
		} else {
			Bisia.Map.marker = L.marker(position).addTo(Bisia.Map.map).bindPopup(popup).openPopup();
		}
		/*if (radius) {
			Bisia.Map.circle = L.circle(position, radius).addTo(Bisia.Map.map);
		}*/
	},

	/**
	 * Parse out city from location
	 * @param  {[type]} location [description]
	 * @return {[type]}          [description]
	 */
	getCityFromLocation: function(location) {
		var locArr = location.split(', ');
		var index = locArr.length - 1;
		var city;

		// console.log(locArr);

		// CAP 3a posizione
		if (!isNaN(locArr[index - 2])) {
			city = locArr[index - 1];
		} else {
			city = locArr[index];
		}

		return city;
	},

	/**
	 * Fill the popup content accordingly to position data
	 * @return {String}
	 */
	getPopupContent: function() {
		var string, verb, timeAgo, location, city = '', popupClass = '';
		var verb = 'è';
		var position = this.ownerPosition;
		if (position) { // tag esistente
			var createdAt = moment(position.createdAt);
			var usePast = createdAt.isBefore(moment().subtract(5, 'minute')) ? true : false;
			if(position.titleEvent) {
				string = '<span>' + position.titleEvent + '</span>';
				timeAgo = createdAt.format('dddd DD MMMM [alle] HH:mm');
				location = (!!position.tag) ? position.tag : position.location;
				popupClass = 'event';
			} else {
				if (position.userId == Meteor.userId()) {
					verb = usePast ? 'eri' : 'sei';
					string = '<span>Tu '+verb+' qui:</span>';
				} else {
					verb = usePast ? 'era' : 'è';
					string = '<span>' + position.username + ' '+verb+' qui:</span>';
				}
				timeAgo = createdAt.fromNow();
				location = (!!position.tag) ? position.tag : position.location;
			}
			timeAgo = '<small>' + timeAgo + '</small>';
			if (position.tag && !!position.location) {
				// city = ' - ' + _.last(position.location.split(', '));
				city = ' - ' + this.getCityFromLocation(position.location);
			}
			var content = (position.justName) ? location : string + location + city + timeAgo;
			return '<div class="'+popupClass+'">' + content + '</div>';
		} else { // tag da impostare
			return '<span>Tu sei qui:</span>';
		}
	},

	/**
	 * Popup content of people near you
	 * @param  {Object} userObj
	 * @return {String}
	 */
	getPopupNearYou: function(userObj) {
		var profile = userObj.profile;
		var position = profile.position;
		var location = (!!position.tag) ? position.tag : position.location;
		location = '<span>' + location + '</span>';
		var timeAgo = moment(position.createdAt).fromNow();
		timeAgo = '<small>' + timeAgo + '</small>';
		var nickname = '<big class="'+profile.gender+'">'+ userObj.username +'</big>';
		var content = nickname + location + timeAgo;
		return '<div class="write-message"' +
				'data-target="'+userObj._id+'"' +
				'data-username="'+userObj.username+'"' +
				'data-gender="'+userObj.profile.gender+'">' + content + '</div>';
	},

	/**
	 * Show positions of all users
	 * @param  {Template.instance} instance
	 * @return {Void}
	 */
	templateInstance: function(instance) {
		var parent = this;
		// Init reactive vars
		instance.ready = new ReactiveVar(false);
		// remove layer
		// this.map.removeLayer(this.circle);
		// Autorun
		instance.autorun(function() {
			// subscribe to publication
			var subscription = Meteor.subscribe('nearYou', instance.data.position, 500);	// distance in m
			// trigger reactivity
			if (subscription.ready()) {
				instance.ready.set(true);
			} else {
				instance.ready.set(false);
			}

			// always remove all old user markers
			if (parent.markersLayer) {
				parent.map.removeLayer(parent.markersLayer);
			}

			// Get users
			var users = Bisia.User.getUsersAroundMe(instance.data.position, 500);
			// Create a layer for markers
			parent.markersLayer = new L.FeatureGroup();

			// track all popups
			var popups = [];

			// Loop through users
			_.each(users, function(user) {
				var position = parent.getCenterMap(parent.spanCoordinates(user.profile.position));
				var popup = parent.getPopupNearYou(user);
				var markerUser = L.marker(position).bindPopup(popup);
				parent.markersLayer.addLayer(markerUser);
				// add marker to array
				popups.push(markerUser);
			});
			// add layer to the map
			parent.map.addLayer(parent.markersLayer);

			// center on me
			var mapObj = parent.getCenterMap(parent.ownerPosition);
			parent.setView(mapObj, parent.zoom);

			// open all popups
			_.each(popups, function(popup) {
				popup.openPopup();
			});
		});
		// create range 500m
		this.circle = L.circle(this.ownerPosition, 500, {
			'color': '#ffcc00',
			'weight': 3,
		}).addTo(this.map);
	},

	/**
	 * Span coordinates randomly in the same position
	 * @param  {Object} position
	 * @return {Object}
	 */
	spanCoordinates: function(position) {
		// +- 0.0005
		var rndLat = parseFloat(_.random(-5, 5) * 0.0001 + parseFloat(position.lat));
		// console.log(position.lat, rndLat);
		position.lat = rndLat;
		var rndLng = parseFloat(_.random(-5, 5) * 0.0001 + parseFloat(position.lng));
		// console.log(position.lng, rndLng);
		position.lng = rndLng;
		return position;
	}

};