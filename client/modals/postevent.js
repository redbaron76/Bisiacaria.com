Template.newPostEventModal.rendered = function() {
	var tabObj = Bisia.Ui.getTabObject(this.data, 'newPostTab');
	Bisia.Ui.setReactive('tab', tabObj);
}

Template.newPostEventModal.events({
	'click [data-change=tab]': function(e, t) {
		Bisia.Ui.manageTab(e, this);
	}
});

Template.tabPostEventWrapper.helpers({
	hasTab: function() {
		return Bisia.Ui.tab.get();
	}
});

Template.newPostTab.rendered = function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-post').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-post').mask('99:99', {placeholder: 'hh:mm'});
}

Template.newPostTab.events({
	'click #open-categories': function(e, t) {
		e.preventDefault();
		var infoObject = Bisia.User.getPostCategories('categoryList');
		Bisia.Ui.setReactive('info', infoObject);
	}
});

Template.newEventTab.rendered = function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-event').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-event').mask('99:99', {placeholder: 'hh:mm'});
}