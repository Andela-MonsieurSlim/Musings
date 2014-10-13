'use strict';

//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Reflections', ['$resource',
	function($resource) {
		return $resource('reflections/:reflectionId', {
			reflectionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]).factory('ReflectionUtilities', function() {
	var Utils = {};

	Utils.setReflection = function(ref) {
		Utils.reflection = ref;
	};

	Utils.getReflection = function() {
		return Utils.reflection;
	}

	return Utils;
});