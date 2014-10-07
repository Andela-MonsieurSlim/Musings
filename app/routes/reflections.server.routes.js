'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users'),
	reflections = require('../../app/controllers/reflections'),
	comments = require('../../app/controllers/comments');

module.exports = function(app) {
	// Reflection Routes
	app.route('/reflections')
		.get(reflections.list)
		.post(users.requiresLogin, reflections.create);

	app.route('/reflections/:reflectionId')
		.get(reflections.read)
		.put(users.requiresLogin, reflections.hasAuthorization, reflections.update)
		.delete(users.requiresLogin, reflections.hasAuthorization, reflections.delete);
	// Comment Routes
	app.route('/reflections/:reflectionId/comments')
    	.post(users.requiresLogin, comments.addComment);
    // Like Routes
    app.route('/reflections/:reflectionId/likes')
    	.post(users.requiresLogin, reflections.likeReflection);

	// Finish by binding the reflection and comment middleware
	app.param('reflectionId', reflections.reflectionByID);
	app.param('commentId', comments.commentByID);
};