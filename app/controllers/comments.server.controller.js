'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Reflection = mongoose.model('Reflection'),
	_ = require('lodash'),
	reflections = require('../../app/controllers/reflections');
	
/**
 * Create a comment
 */
exports.addComment = function(req, res) {
	var reflection = req.reflection;
	var comment = req.body;
	comment.author = req.user;
	reflection.comments.unshift(comment);

	reflection.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reflection);
		}
	});
};



/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {
	req.comment = req.reflection.comments.id(id);
	next();

	
};

/**
 * Comment authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.comment.author.toString() !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};