'use strict';

//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Comments', ['$resource',
	function($resource) {
		return $resource('reflections/:reflectionId/comments/:commentId', {reflectionId: '@reflectionId', commentId: '@_id'
		});
	}
]);