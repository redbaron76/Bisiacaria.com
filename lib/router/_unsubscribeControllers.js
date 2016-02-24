// ACCESS CONTROLLER
UnsubscribeController = RouteController.extend({
    getUserId: function() {
        return this.params.userId;
    },
    action: function() {
        var id = this.getUserId();
        if (id) {
            Meteor.call('deleteOldUserAccount', id, function(error, success) {
                if (success) {
                    alert('Il tuo account è stato rimosso');
                }
            });

        }
    }
});