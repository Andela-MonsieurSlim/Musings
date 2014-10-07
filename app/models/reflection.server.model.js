'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


/**
 *Likes Schema
*/
var LikeSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	like: {
		type: Number,
		default: 0
	}
});

/**
 * Comments Schema
 */
var CommentSchema = new Schema({ 
	author: {
	    type: Schema.ObjectId,
	    ref: 'User'
  	},
  	commentBody: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});


/**
 * Reflection Schema
 */
var ReflectionSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	content: {
		type: String,
		default: '',
		trim: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	comments: {
		type: [CommentSchema],
		default: []
	},
	likes: {
		type: [LikeSchema],
		default: []
	},
});

mongoose.model('Reflection', ReflectionSchema);