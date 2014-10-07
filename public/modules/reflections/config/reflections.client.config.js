'use strict';

// Configuring the Reflections module
angular.module('reflections').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reflections', 'reflections', 'dropdown', '/reflections(/create)?');
		Menus.addSubMenuItem('topbar', 'reflections', 'List Reflections', 'reflections');
		Menus.addSubMenuItem('topbar', 'reflections', 'New Reflection', 'reflections/create');
	}
]);