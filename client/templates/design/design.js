Meteor.startup(function() {
	// if (Meteor.isCordova) {
		/*$(document.body).touchwipe({
			wipeLeft: function () {
				Bisia.Ui.toggleSidebar('sidebar-open-right');
			},
			wipeRight: function () {
				Bisia.Ui.toggleSidebar('sidebar-open-left');
			},
			preventDefaultEvents: false
		});*/
	// }
});

/*Template.baseTemplate.events({
	'click .md-overlay': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar();
	}
});*/

/*Template.navbarTop.events({
	'click .toggle-menu': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-left');
	},
	'click .toggle-users': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-right');
	}
});*/

Template.profileTemplate.events({
	'click .toggle-info': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleClass('flip', '.flip-container', t);
	},
	'click #question': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click .write-message': function(e, t) {
		e.preventDefault();
		openMessage();
	},
	'click .send-vote, click .send-thumbs-up': function(e, t) {
		e.preventDefault();
		sendNotification('vote');
		$('#counter-votes').html(parseInt($('#counter-votes').html(), 10)+1);
	},
	'click #know-yes': function(e, t) {
		Bisia.Ui.toggleActive(e);
		$('#counter-knowers').html(parseInt($('#counter-knowers').html(), 10)+1);
	},
	'click #know-no': function(e, t) {
		Bisia.Ui.toggleActive(e);
		$('#counter-knowers').html(parseInt($('#counter-knowers').html(), 10)-1);
	},
	'click .load-more': function(e, t) {
		fakeList(e, '.posts');
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#profile', 468, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '.posts > article:last', '#profile', 'bottom-show');
		$(e.target).find('.flip-container').removeClass('flip');
	}
});

/*Template.sidebarRight.events({
	'click .write-message': function(e, t) {
		e.preventDefault();
		openMessage();
	},
	'click li > a': function(e, t) {
		e.preventDefault();
		swipeUserListItem(e);
	},
	'click .send-vote': function(e, t) {
		e.preventDefault();
		sendNotification('vote');
	}
});*/

Template.popupWrapper.events({
	'click .md-popup .close': function(e, t) {
		e.preventDefault();
		$('.md-popup').removeClass('md-show');
		$('.md-message').attr('class', 'md-message');
	},
	'click .md-popup .send-message': function(e, t) {
		e.preventDefault();
		sendMessage();
	}
});

Template.bubbleWrapper.events({
	'click button.close': function(e, t) {
		closeNotification(e);
	}
});

/*Template.navbarModal.events({
	'click .md-close': function(e, t) {
		e.preventDefault();
		$('.md-modal').removeClass('md-open');
	}
});*/

Template.registerTemplate.events({
	'click #terms-conditions': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #rules': function(e, t) {
		Bisia.Ui.toggleModal(e);
	}
});

Template.articleTemplate.rendered = function() {
	this.$('.autosize').autosize({ append: '' });
}

Template.articleTemplate.events({
	'click #share-this': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#profile', 200, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '.comments-list > li:last', '#profile', 'bottom-show');
	}
});

/*Template.settingsTemplate.rendered = function() {

	var counter = {
		countDown: true,
		stopInputAtMaximum: true
	};

	this.$('.count').textcounter(_.extend(counter, { max: 100}));
	this.$('#bio').textcounter(_.extend(counter, { max: 140}));
	this.$('#location').textcounter(_.extend(counter, { max: 50}));

	this.$('.autosize').autosize({ append: '' });
};*/

/*Template.settingsTemplate.events({
	'click #question': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #lovehate': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #take-image': function(e, t) {
		MeteorCamera.getPicture(function (error, data) {
			if (!error) {
				$('#take-image').attr('src', data);
			} else {
				log(error);
			}
		});
	},
	'click #upload-image': function(e, t) {
		e.preventDefault();

		var $preview = $(e.target);
		var $form = $preview.next('#image-form');

		$form.trigger('click');

		$form.on('change', function() {
			var file    = this.files[0];
			var reader  = new FileReader();

			reader.onloadend = function () {
				$preview.attr('src', reader.result);
			}

			if (file) {
				reader.readAsDataURL(file);
			} else {
				$preview.attr('src', '');
			}
		});

		return false;
	}
});*/

Template.visitorsTemplate.events({
	'click .send-vote': function(e, t) {
		e.preventDefault();
		// sendNotification('vote');
		voteListAnimation(e);
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'click .load-more': function(e, t) {
		fakeList(e, '.item-list');
	},
	'scroll .content': function(e, t) {
		// moreOnBottom(e, '.item-list', '.list', 'bottom-show');
		Bisia.Ui.toggleAtBottom(e, '.item-list > li:last', '.list', 'bottom-show');
	}
});