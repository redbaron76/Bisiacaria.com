// Iron Router Hooks
Router.onBeforeAction(Bisia.Login.requireLogin, {
	except: [
		'loginUser',
		'registerUser',
		'recoverPassword',
		'resetPassword',
		'confirmEmail'
	]
});

Router.onBeforeAction(Bisia.Login.alreadyLogged, {
	only: [
		// 'loginUser',
		'registerUser',
		'recoverPassword',
		'resetPassword',
		'confirmEmail'
	]
});