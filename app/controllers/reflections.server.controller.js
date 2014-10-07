'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Reflection = mongoose.model('Reflection'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Reflection already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a reflection
 */
exports.create = function(req, res) {
	var reflection = new Reflection(req.body);
	reflection.user = req.user;

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
 * Show the current reflection
 */
exports.read = function(req, res) {
	res.jsonp(req.reflection);
};

/**
 * Update a reflection
 */
exports.update = function(req, res) {
	var reflection = req.reflection;

	reflection = _.extend(reflection, req.body);

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
 * Delete an reflection
 */
exports.delete = function(req, res) {
	var reflection = req.reflection;

	reflection.remove(function(err) {
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
 * List of Reflections
 */
exports.list = function(req, res) {
	Reflection.find().sort('-created').populate('user', 'displayName').exec(function(err, reflections) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(reflections);
		}
	});
};

/**
 * Like a reflection
 */
exports.likeReflection = function(req, res) {
    
    var reflection = req.reflection;
    var like = req.body;
        like.user = req.user;
        
    for(var i = 0; i < reflection.likes.length; i++) {
        console.log('in the likes loop');
        if (reflection.likes[i].user.toString() === req.user._id.toString()) {
            // reflection.likes[i] = like;
            reflection.likes.splice(i, 1);
            break;
        }
    }

    //Push the new like into the reflection
    reflection.likes.push(like);

    reflection.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            res.jsonp(reflection);
        }
    });
};


/**
 * Reflection middleware
 */
exports.reflectionByID = function(req, res, next, id) {
	Reflection.findById(id).populate('user', 'displayName').exec(function(err, reflection) {
		if (err) return next(err);
		if (!reflection) return next(new Error('Failed to load reflection ' + id));
		req.reflection = reflection;
		next();
	});
};

/**
 * Reflection authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.reflection.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};