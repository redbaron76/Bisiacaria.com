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

		var myEv = _.findWhere(user.evaluates, { authorId: Meteor.userId() });
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
			Meteor.call('evaluateUser', targetId, results, function(error, success) {
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

var evaluates = [{
	authorId: 'fhfgBHFVBjhnkhBGJNkhkmL',
	cratedAt: new Date(),
	updatedAt: new Date(),
	values: {
		figo: [30, true],
		festaiolo: [30, true],
		affidabile: [30, false],
		popolare: [30, true],
		simpatico: [30, true]
	}
}];