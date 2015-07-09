Meteor.methods({
	saveNewPost: function(formObj) {
		check(this.userId, String);
		check(formObj, {
			text: String,
			category: String,
			dateTimePost: Date,
			imageUrl: String,
			position: Object,
			tagId: String
		});

		var user = Meteor.user();
		var actionKey = 'post';
		var postObj = _.extend(formObj, {
			authorId: this.userId,
			createdAt: Bisia.Time.setServerTime()
		});

		// set and remove tagid
		var tagId = postObj.tagId;

		var errors = Bisia.Validation.validateNewPost(postObj);

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		postObj.text = Bisia.Form.formatEmoj(postObj.text);

		// add category if any and not present
		if (!!postObj.category)
			Users.update(this.userId, { $addToSet: { 'profile.categories': postObj.category } });

		// add counter arrays
		postObj = _.extend(postObj, {
			likes: [],
			unlikes: [],
			comments: [],
			likesRating: 0,
			commentsCount: 0
		});

		// Add position loc if coordinates are present
		if (postObj.position.lat && postObj.position.lng) {
			postObj = _.extend(postObj, Bisia.Form.createMapLoc(postObj.position));

			// Se esiste un geotag...
			if (postObj.position.tag.length > 0) {
				var placeId, query;

				// set default category for location
				postObj.category = 'si trova in questa posizione';

				// select query to check
				if (!!tagId) {
					query = { '_id': tagId };
				} else {
					query = {
						// 'tag': { '$regex': postObj.position.tag, '$options': 'i' },
						'tag': postObj.position.tag,
						'loc': {
							'$near': {
								'$geometry': {
									'type': 'Point',
									'coordinates': [ parseFloat(postObj.position.lat), parseFloat(postObj.position.lng) ]
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
					postObj.position.lat = chkPos.lat;
					postObj.position.lng = chkPos.lng;
					if (chkPos.location) postObj.position.location = chkPos.location;
					postObj.position.tag = chkPos.tag;
					placeId = chkPos._id;
				} else {
				// se non esiste, inserisco in places
					var placeObj = {
						lat: postObj.position.lat,
						lng: postObj.position.lng,
						location: postObj.position.location,
						tag: postObj.position.tag,
						keywords: [],
						joiners: [],
						joinersCount: 0,
						authorId: this.userId,
						createdAt: new Date()
					};
					// add loc object
					placeObj.loc = postObj.loc;
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
		} else {
			postObj.position = {};
		}

		// Insert into collection
		postObj.text = Bisia.Form.sanitizeHTML(postObj.text);
		postObj._id = Posts.insert(postObj);

		// Log the post
		Bisia.Log.info('post', postObj);

		var details = {
			imageUrl: postObj.imageUrl,
			position: postObj.position
		};

		Bisia.Notification.notifyMyFollowers('note', actionKey, postObj, details, 'dateTimePost');
		Bisia.Notification.notifyCiteUsers('note', actionKey, postObj, 'post');

		return true;
	},
	saveFlyPosition: function(position) {
		check(this.userId, String);
		check(position, Object);

		var tagId;
		var user = Meteor.user();
		if (position.tagId) {
			tagId = position.tagId;
			position = _.omit(position, 'tagId');
		}

		// add counter arrays
		var postObj = {
			authorId: this.userId,
			createdAt: Bisia.Time.setServerTime(),
			dateTimePost: Bisia.Time.setServerTime(),
			category: 'si trova in questa posizione',
			position: position,
			imageUrl: '',
			likes: [],
			unlikes: [],
			comments: [],
			likesRating: 0,
			commentsCount: 0
		};

		postObj = _.extend(postObj, Bisia.Form.createMapLoc(position));

		if (tagId) {

			postObj = _.extend(postObj, {
				tagId: tagId
			});

			// user who join the place
			var joinersObj = {
				authorId: this.userId,
				createdAt: new Date()
			};
			// Update places
			Places.update(tagId, {
				$addToSet: { 'joiners': joinersObj },
				$inc: { 'joinersCount': 1 }
			});
		}

		// Insert into collection
		postObj.text = Bisia.Form.sanitizeHTML(postObj.text);
		postObj._id = Posts.insert(postObj);
		// console.log(postObj);
		// Log the post
		Bisia.Log.info('post', postObj);

		var details = {
			imageUrl: postObj.imageUrl,
			position: postObj.position
		};
		Bisia.Notification.notifyMyFollowers('note', 'geotag', postObj, details, 'dateTimePost');

		return true;
	},
	sendComment: function(targetPost, text) {
		check(this.userId, String);
		check(text, String);
		check(targetPost, {
			postId: String,
			targetId: String,
			notifyIds: Array
		});

		// Block sending comment if targetId is blocked
		if (Bisia.User.isBlocked(targetPost.targetId))
			return true;

		var comment = {
			text: Bisia.Form.sanitizeHTML(text),
			authorId: this.userId,
			createdAt: Bisia.Time.setServerTime()
		};

		comment.text = Bisia.Form.formatEmoj(comment.text);

		// Add comment to post
		Posts.update(targetPost.postId, { $addToSet: { 'comments': comment }, $inc: { 'commentsCount': 1 } });

		// Log the comment
		Bisia.Log.info('post comment', {postId: targetPost.postId, comment: comment});

		var authorNick = _.pick(Users.findOne({ '_id': targetPost.targetId }), '_id', 'username');

		targetPost = _.extend(targetPost, {
			authorId: authorNick._id,
			authorNick: authorNick.username
		});

		var citeObj = _.extend(comment, {
			_id: targetPost.postId
		});

		Bisia.Notification.notifyCiteUsers('note', 'comment', citeObj, 'commento');

		// Notify post author
		Bisia.Notification.emit('note', {
			actionId: targetPost.postId,
			actionKey: 'comment',
			targetId: targetPost.targetId,
			userId: this.userId,
			message: Bisia.Notification.noteMsg('comment', targetPost, true)
		});

		// Notify joiners of the post
		_.each(targetPost.notifyIds, function(targetId) {
			var selfUser = (comment.authorId == targetPost.authorId) ? true : false;
			Bisia.Notification.emit('note', {
				actionId: targetPost.postId,
				actionKey: 'comment',
				targetId: targetId,
				userId: comment.authorId,
				message: Bisia.Notification.noteMsg('comment', targetPost, false, selfUser)
			});
		});

		return true;
	},
	resetLikeUnlike: function(target) {
		// check(target, String);
		console.log(target);
		return true;
	}
});