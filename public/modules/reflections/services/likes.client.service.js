'use strict';

//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Likes', ['$resource',
	function($resource) {
		return $resource('reflections/:reflectionId/likes/:id', {reflectionId: '@reflectionId', id: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);