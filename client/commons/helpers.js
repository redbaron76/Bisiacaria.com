// Toggle classes for sidebar animation open/close
/*toggleSidebar = function(className) {
	var $wrapper = $('body > .wrapper');
	var $tools = $('.tools-open');
	var timeout = 450;
	var closing;

	// $wrapper.attr('class', 'wrapper');

	if (className) {
		if ($wrapper.is('.sidebar-open-left, .sidebar-open-right')) {
			$wrapper.removeClass('sidebar-open-left sidebar-open-right');
		} else {
			$wrapper.toggleClass(className);
		}

		closing = className === 'sidebar-open-left' ? 'closing-left' : 'closing-right';
	} else {
		$wrapper.removeClass('sidebar-open-left sidebar-open-right');
	}

	if ($wrapper.hasClass('closing-left')) {
		Meteor.setTimeout( function() {
			$wrapper.removeClass('closing-left');
		}, timeout);
	} else if ($wrapper.hasClass('closing-right')) {
		Meteor.setTimeout( function() {
			$wrapper.removeClass('closing-right');
		}, timeout);
	} else {
		if (closing)
			$wrapper.addClass(closing);
	}

	if ($tools.length > 0)
		$tools.removeClass('tools-open');
};*/

/*toggleClass = function(className, el, template) {
	var $header = $(template.find(el));
	$header.toggleClass(className);
};*/

sendNotification = function(which) {
	$('.md-bubble').addClass('md-show');
	$('.md-notification.'+which).addClass('animated bounceInUp').removeClass('hide');
};

openMessage = function() {
	$('.md-popup').addClass('md-show');
	$('.md-message').addClass('animated bounceIn').removeClass('hide');
};

/*sendMessage = function() {
	$('.md-message').removeClass('fadeIn')
					.addClass('bounceOutRight')
					.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
					   		$('.md-popup').removeClass('md-show');
					   		$(this).attr('class', 'md-message');
					   		$('form.message > textarea').val('');

					   		Meteor.setTimeout(function() {
					   			sendNotification('message');
					   		}, 2000);

					   });
};*/

closeNotification = function(e) {
	$el = $(e.target).parents('.md-notification');
	$el.toggleClass('bounceInUp bounceOutLeft')
	   .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
	   		// $el.remove();
	   		// $('.md-bubble').removeClass('md-show');
	   		$el.removeClass('animated bounceOutLeft').addClass('hide');
	   		if ($('.md-notification.hide').length == 2) {
	   			$('.md-bubble').removeClass('md-show');
	   		}
	   });
};

/*swipeUserListItem = function(e) {
	$el = $(e.target);
	if ($el[0].localName != 'li') {
		$el = $el.parents('li');
	}
	$el.siblings('li').removeClass('tools-open');
	$el.toggleClass('tools-open');
};*/

/*toggleModal = function(e) {
	e.preventDefault();
	$('[data-content='+e.target.id+']').toggleClass('md-open');
};*/

/*getOffset = function(e, target, limit, className) {
	var $content = $(e.target);
	var $target = $content.find(target);
	var offset = $content.scrollTop() - $content.offset().top;
	// log(offset);
	if (offset > limit) {
		$target.addClass(className);
	} else {
		$target.removeClass(className);
	}
};*/

/*moreOnBottom = function(e, check, target, className) {
	e.preventDefault();
	var $content = $(e.target);
	var $target = $content.find(target);
	var $check = $(check).find('li:last');
	var offsetTop = $check.offset().top;

	// subtract 15 if isCordova (padding top navbar)
	if (Meteor.isCordova) offsetTop = offsetTop - 15;

	// Bisia.log($content.height(), $check.offset().top);
	if ($content.height() > offsetTop) {
		$target.addClass(className);
	} else {
		$target.removeClass(className);
	}
};*/

fakeList = function(e, list) {
	e.preventDefault();
	var $list = $(list)
	// var $elements = $list.find('li');
	var $elements = $list.contents();
	var more = $elements.clone();
	$list.append(more);
}

/*goTop = function(e) {
	e.preventDefault();
	var $content = (arguments[1]) ? $(arguments[1]) : $(e.target).parents('.content');
	$content.animate({ scrollTop: 0	}, 1000);
};*/

/*toggleAtBottom = function(e, target, element, className) {
	var $content = $(e.target);
	var $target = $content.find(target);
	var $el = $content.find(element);
	if ($target.offset().top < $content.height()) {
		$el.addClass(className);
	} else {
		$el.removeClass(className);
	}
};*/

voteListAnimation = function(e) {
	var $target = $(e.target);
	var $container = $target.parents('.checkbox');
	$container.addClass('animated zoomOut')
			  .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$container.remove();
			  });
}