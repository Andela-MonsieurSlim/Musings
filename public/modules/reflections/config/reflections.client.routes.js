'use strict';

// Setting up route
angular.module('reflections').config(['$stateProvider',
	function($stateProvider) {
		// Reflections state routing
		$stateProvider.
		state('listReflections', {
			url: '/reflections',
			templateUrl: 'modules/reflections/views/list-reflections.client.view.html'
		}).
		state('createReflection', {
			url: '/reflections/create',
			templateUrl: 'modules/reflections/views/create-reflection.client.view.html'
		}).
		state('viewReflection', {
			url: '/reflections/:reflectionId',
			templateUrl: 'modules/reflections/views/view-reflection.client.view.html'
		}).
		state('editReflection', {
			url: '/reflections/:reflectionId/edit',
			templateUrl: 'modules/reflections/views/edit-reflection.client.view.html'
		});
	}
]);