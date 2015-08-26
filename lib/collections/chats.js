// Chats
Chats = new Mongo.Collection('chats');

// Chat Room
Chatroom = new Mongo.Collection('chatroom');

// Chat Users
Chatusers = new Mongo.Collection('chatusers');

/*Chatusers.allow({
	remove: function(userId, chatUser) { return Bisia.User.ownsDocument(userId, chatUser); }
});*/