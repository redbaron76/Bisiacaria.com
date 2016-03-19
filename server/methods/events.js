Meteor.methods({
	saveNewEvent: function(formObj) {
		check(this.userId, String);
		check(formObj, {
			text: String,
			titleEvent: String,
			dateTimeEvent: Date,
			locationEvent: String,
			imageUrl: String,
			originalUrl: String,
			tagId: String,
			position: Object
		});

		if (formObj.tagId.length > 0) {
			formObj.position.tag = formObj.locationEvent;
		}

		// set and remove tagid
		var tagId = formObj.tagId;

		var eventObj = _.extend(formObj, {
			authorId: this.userId,
			createdAt: Bisia.Time.setServerTime(),
			joinersCount: 0,
			joiners: [],
			visitorsCount: 0,
			visitors: []
		});

		var errors = Bisia.Validation.validateNewEvent(eventObj, 'SERVER');

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		eventObj.text = Bisia.Form.formatEmoj(eventObj.text);

		// Add position loc if coordinates are present
		// Add position loc if coordinates are present
		if (eventObj.position.lat && eventObj.position.lng) {
			eventObj = _.extend(eventObj, Bisia.Form.createMapLoc(eventObj.position));

			// Se esiste un geotag...
			if (eventObj.position.tag.length > 0) {
				var placeId, query;

				// select query to check
				if (!!tagId) {
					query = { '_id': tagId };
				} else {
					query = {
						'tag': { '$regex': '^'+eventObj.position.tag, '$options': 'i' },
						'loc': {
							'$near': {
								'$geometry': {
									'type': 'Point',
									'coordinates': [ parseFloat(eventObj.position.lat), parseFloat(eventObj.position.lng) ]
								},
								'$minDistance': 1,
								'$maxDistance': 100
							}
						}
					};
				}

				// Controlla che non ci sia già qualcosa di vicino con lo stesso tag
				var chkPos = Places.findOne(query);

				// se esiste, sostituisco la posizione con quella trovata
				if (chkPos) {
					eventObj.position.lat = chkPos.lat;
					eventObj.position.lng = chkPos.lng;
					if (chkPos.location) eventObj.position.location = chkPos.location;
					eventObj.position.tag = chkPos.tag;
					placeId = chkPos._id;
				} else {
				// se non esiste, inserisco in places
					var placeObj = {
						lat: eventObj.position.lat,
						lng: eventObj.position.lng,
						location: eventObj.position.location,
						tag: eventObj.position.tag,
						keywords: [],
						joiners: [],
						joinersCount: 0,
						authorId: this.userId,
						createdAt: new Date()
					};
					// add loc object
					placeObj.loc = eventObj.loc;
					placeId = Places.insert(placeObj);
					// Log the place insert
					Bisia.Log.info('place', placeObj);
				}

				// user who join the place
				var joinersObj = {
					authorId: this.userId,
					createdAt: new Date()
				};

				// Set the actionKey
				actionKey = 'geotag';

				// Update places
				Places.update(placeId, {
					$addToSet: { 'joiners': joinersObj },
					$inc: { 'joinersCount': 1 }
				});
			}
		}


		// Insert into collection
		eventObj.text = Bisia.Form.sanitizeHTML(eventObj.text);
		eventObj._id = Events.insert(eventObj);

		Bisia.Notification.notifyCiteUsers('note', 'event', eventObj, 'evento');

		// Log the event
		Bisia.Log.info('new event', eventObj);

		var details = {
			text: eventObj.text,
			imageUrl: eventObj.imageUrl,
			position: eventObj.position
		};

		/*// Get people blocked
		var blockIds = Bisia.User.getBlockIds(this.userId);
		var myFollowers = Meteor.user()['followers'];

		//Notify to all followers
		_.each(myFollowers, function(el) {
			Bisia.Notification.emit('note', {
				userId: user._id,
				targetId: el,
				actionId: eventObj._id,
				actionKey: 'event',
				message: Bisia.Notification.postEventMsg('event', eventObj, details)
			}, blockIds);
		});*/

		Bisia.Notification.notifyMyFollowers('note', 'event', eventObj, details);

		return true;
	},
	joinEvent: function(eventObj) {
		check(this.userId, String);
		check(eventObj, {
			eventId: String,
			eventTitle: String,
			eventLocation: String,
			eventDateTime: Date,
			authorId: String,
			check: Boolean
		});

		var userId = this.userId;
		var isJoin = eventObj.check;

		if (isJoin) {
			var join = {
				text: '',
				authorId: userId,
				createdAt: Bisia.Time.setServerTime()
			};

			if (Events.find({ '_id': eventObj.eventId, 'joiners': { '$elemMatch': { 'authorId': userId } } }).count() == 0) {
				Events.update(eventObj.eventId, { $addToSet: { 'joiners': join }, $inc: { 'joinersCount': 1 } });
				// Notify join to author user
				Bisia.Notification.emit('note', {
					userId: userId,
					targetId: eventObj.authorId,
					actionId: eventObj.eventId,
					actionKey: 'join',
					message: Bisia.Notification.postEventMsg('join', eventObj, {})
				});

				// Notify all my followers
				Bisia.Notification.notifyMyFollowers('note', 'join', eventObj, {});
			}


		} else {
			Events.update(eventObj.eventId, { $pull: { 'joiners': { 'authorId': userId } }, $inc: { 'joinersCount': -1 } });
			Notifications.remove({ 'userId': userId, 'actionId': eventObj.eventId });
		}

	},
	sendCommentEvent: function(eventId, text) {
		check(this.userId, String);
		check(eventId, String);
		check(text, String);

		text = Bisia.Form.formatEmoj(text);

		// Add comment to post
		Events.update({ '_id': eventId, 'joiners.authorId': this.userId }, { '$set': { 'joiners.$.text': Bisia.Form.sanitizeHTML(text), 'joiners.$.createdAt': Bisia.Time.setServerTime() } });

		// Log the event comment
		Bisia.Log.info('event comment ', {eventId: eventId, authorId: this.userId});

		// Get targetIds
		var parent = this;
		var targetIds = [];
		var eventObj = Events.findOne({ _id: eventId },{ authorId: true, joiners: true });
		// get authorId
		var authorId = eventObj.authorId;
		// add joiners id
		_.each(eventObj.joiners, function(value, key) {
			targetIds.push(value.authorId);
		});

		// remove authorId and yourself
		targetIds = _.without(targetIds, authorId, this.userId);

		var citeObj = {
			text: text,
			_id: eventId
		};

		Bisia.Notification.notifyCiteUsers('note', 'commentEvent', citeObj, 'commento all\'evento');

		// Notify post author
		Bisia.Notification.emit('note', {
			actionId: eventId,
			actionKey: 'commentEvent',
			targetId: authorId,
			userId: this.userId,
			message: Bisia.Notification.noteMsg('commentEvent', eventObj, true)
		});

		// Notify joiners of the post
		_.each(targetIds, function(targetId) {
			Bisia.Notification.emit('note', {
				actionId: eventId,
				actionKey: 'commentEvent',
				targetId: targetId,
				userId: parent.userId,
				message: Bisia.Notification.noteMsg('commentEvent', eventObj, false)
			});
		});

		return true;
	},
	trackVisitEvent: function(eventId) {
		check(this.userId, String);
		Events.update(eventId, { $addToSet: { 'visitors': this.userId }, $inc: { 'visitorsCount': 1 } });
		return true;
	}
});