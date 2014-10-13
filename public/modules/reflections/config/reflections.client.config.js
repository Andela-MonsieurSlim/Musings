'use strict';

// Configuring the Reflections module
angular.module('reflections').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reflections', 'reflections', 'dropdown', '/reflections(/create)?');
		Menus.addSubMenuItem('topbar', 'reflections', 'All Reflections', 'reflections');
		Menus.addSubMenuItem('topbar', 'reflections', 'Create a Reflection', 'reflections/create');
	}
]);