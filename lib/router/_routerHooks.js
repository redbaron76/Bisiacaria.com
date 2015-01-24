// Iron Router Hooks
Router.onBeforeAction(Bisia.Login.requireLogin, {except:['registerUser', 'recoverPassword', 'resetPassword', 'confirmEmail']});
Router.onBeforeAction(Bisia.Login.alreadyLogged, {only:['registerUser', 'recoverPassword', 'resetPassword', 'confirmEmail']});