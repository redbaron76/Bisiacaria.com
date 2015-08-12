
// Paginator

/**
 * Bisia.Paginator.init(this, {
 * 		subsTo: 'userFriendsList',
 * 		collection: 'friends',
 * 		query: {
 * 			'userId': '_id'
 * 		}
 * })
 */

Bisia.Paginator = {
	increment: 20,
	// skip: 0,
	limit: 20,
	instance: null,
	init: function(instance, config) {
		// set the instance
		this.instance = instance;
		// set instance data
		this.data = instance.data;
		// Init reactive vars
		this.instance.ready = new ReactiveVar(false);
		// Init reactive vars
		this.instance.hasMoreData = new ReactiveVar(false);
		// Set default cursor
		this.instance.cursor = new ReactiveVar({ /*skip: this.skip, */limit: this.limit });
		// Set config
		this.setConfig(config);
		// Run the autorun
		this.runAutorun();
	},
	setConfig: function(config) {
		this.sort = config.sort || { 'createdAt': -1, '_id': -1 };
		this.subsTo = config.subsTo || 'userFriendsList';
		this.collection = config.collection || 'users';
		this.query = config.query || {};
	},
	setCursor: function() {
		var parent = this;
		this.instance.setCursor = function() {
			var cursor = parent.instance.cursor.get();
			// cursor.skip = cursor.limit;
			cursor.limit = cursor.limit + parent.increment;
			parent.instance.cursor.set(cursor);
		}
	},
	getData: function() {
		var parent = this;
		this.instance.getData = function() {
			// get total published
			parent.instance.total = Bisia.getCollection(parent.collection).find({}).count();
			// set flag if has more data than limit to display
			if (parent.instance.total > parent.instance.cursor.get().limit) {
				parent.instance.hasMoreData.set(true);
			} else {
				parent.instance.hasMoreData.set(false);
			}
			// return paginated collection
			return Bisia.getCollection(parent.collection).find(parent.buildQuery(), parent.buildOptions());
		}
	},
	buildQuery: function() {
		if (!_.isEmpty(this.query)) {
			var parent = this, query = {};
			for (var key in this.query) {
				if (parent.data[this.query[key]]) {
					query[key] = parent.data[this.query[key]];
				} else {
					query[key] = this.query[key];
				}
			}
			return query;
		}
		return this.query;
	},
	buildOptions: function() {
		var increment = arguments[0] || 0;
		var cursor = this.instance.cursor.get();
		return {
			'sort': this.sort,
			// 'skip': cursor.skip,
			'limit': cursor.limit + increment
		};
	},
	runAutorun: function() {
		var parent = this;
		this.instance.autorun(function() {
			var sub = Meteor.subscribe(parent.subsTo, parent.buildQuery(), parent.buildOptions(parent.increment));
			//trigger reactivity
			var ready = true;
			if (!parent.instance.total) {
				ready = sub.ready() ? true : false;
			}
			parent.instance.ready.set(ready);
		});
		// add the main query to instance.getData
		this.getData();
		this.setCursor();
	},
	triggerBottom: function(e) {
		var el = e.currentTarget;
		var offsetTop = el.offsetHeight + el.scrollTop;
		if (offsetTop == el.scrollHeight && this.instance.hasMoreData.get()) {
			this.instance.setCursor();
		}
	}
}