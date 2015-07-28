Template.evaluateUserModal.helpers({
	getTitle: function() {
		return 'Valuta ' + this.username;
	},
	prepareEvaluation: function() {
		var items, user = this, evaluateItems = [];
		var gender = Bisia.User.getProfile('gender', this);

		if (gender == 'male') {
			items = Bisia.User.evaluateMale;
		} else {
			items = Bisia.User.evaluateFemale;
		}

		// var myEv = _.findWhere(user.evaluates, { authorId: Meteor.userId() });
		var myEv = Evaluations.findOne({ 'targetId': user._id, 'userId': Meteor.userId() });
		if (!myEv) myEv = {};

		_.each(items, function(label, index) {
			var val = myEv['values'] ? myEv['values'][label][0] : 0;
			var checked = myEv['values'] ? myEv['values'][label][1] : false;
			var item = {};
			item.index = index + 1;
			item.name = label;
			item.value = val;
			item.checked = checked;
			evaluateItems.push(item);
		});

		return {
			evaluateItems: evaluateItems
		}
	}
});

Template.evaluateUserModal.events({
	'submit #form-user-evaluate': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var targetId = t.data._id;
		var username = t.data.username;
		var results = {}, anon = {};
		var formObject = Bisia.Form.getFields($target);

		_.each(formObject, function(value, index) {
			if (index.indexOf('anon') == 0) {
				var key = index.replace('anon-', '');
				anon[key] = true;
			} else {
				results[index] = [value, false];
			}
		});

		_.each(anon, function(value, index) {
			results[index][1] = value;
		});

		if (results) {
			Meteor.call('evaluateUser', username, targetId, results, function(error, success) {
				if(error) {
					Bisia.log('saveNewPost', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if (success) {
					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'evaluateUserModal')
							.submitSuccess('La tua valutazione è stata registrata correttamente.', 'Registrato!', null, true);
				}
			});
		}
	}
}),

Template.evaluateItem.onRendered(function() {
	var instance = this;
	var data = instance.data;
	var $from = instance.$('.slider-from');
	instance.$(".bisia-slider").slider({
		min: 0,
		max: 100,
		step: 10,
		value: parseInt(data.value),
		tooltip: 'hide',
		formatter: function() {
			$from.html(this.value[0]);
		}
	});
});

Template.viewEvaluationUserModal.onCreated(function() {
	var instance = this;
	instance.data = this.data.user;
	Bisia.Paginator.init(instance, {
		subsTo: 'userEvaluationList',
		collection: 'evaluations',
		query: {
			'targetId': '_id'
		}
	});
});

Template.viewEvaluationUserModal.helpers({
	uppercaseTitle: function() {
		var string = this.data.label;
		return {
			title: string[0].toUpperCase() + string.substring(1)
		};
	},
	votesUsers: function() {
		var results = [];
		var data = Template.instance().getData();
		data.map(function(value, index) {
			var obj = {};
			obj.userId = value.userId;
			obj.createdAt = value.createdAt;
			obj.vote = value.values[this.key][0];
			obj.visible = !value.values[this.key][1];
			results.push(obj);
		}, { key: this.data.label });
		return results;
	},
	hasMoreData: function() {
		return Template.instance().hasMoreData.get();
	},
	pageReady: function() {
		return Template.instance().ready.get();
	}
});

Template.viewEvaluationUserModal.events({
	'click .username': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Paginator.triggerBottom(e);
	}
});