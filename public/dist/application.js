'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'musings';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngRoute',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reflections');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$http',
  '$scope',
  'Authentication',
  'Reflections',
  'Comments',
  'Likes',
  'ReflectionUtilities',
  function ($http, $scope, Authentication, Reflections, Comments, Likes, ReflectionUtilities) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $scope.welcomeMessage = new Date();
    $scope.items = [];
    $scope.posts = [];
    $scope.loading = false;
    $scope.postsRefresh = function () {
      location.reload();
      return false;
    };
    $scope.fillContent = function (post) {
      ReflectionUtilities.setReflection(post);
    };
    window.fbAsyncInit = function () {
      $scope.$apply($scope.loading = true);
      FB.init({
        appId: '639286812854499',
        xfbml: true,
        version: 'v2.1'
      });
      //Check User's log-in Status
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          //Retrieve Facebook Posts 
          FB.api('/me/statuses?limit=100&format=json', function (response) {
            //Operations on response data
            $scope.items.push(response.data);
            $scope.item = $scope.items[0];
            for (var i = 0; i < $scope.item.length; i++) {
              if ($scope.item[i].comments == undefined && $scope.item[i].likes == undefined) {
                continue;
              }
              if ($scope.item[i].comments != undefined && $scope.item[i].comments.data.length >= 10) {
                $scope.posts.push($scope.item[i].message);
              }
              if ($scope.item[i].likes != undefined && $scope.item[i].likes.data.length >= 10) {
                $scope.posts.push($scope.item[i].message);
              }
              $scope.loading = false;
            }
            ;
            $scope.$apply();
          });
        } else {
          //Prompt User to get Logged In
          FB.login(function () {
            //Retrieve Facebook Posts
            FB.api('/me/statuses?limit=30&format=json', function (response) {
              //Operations on response data
              $scope.items.push(response.data);
              $scope.item = $scope.items[0];
              for (var i = 0; i < $scope.item.length; i++) {
                if ($scope.item[i].comments == undefined && $scope.item[i].likes == undefined) {
                  continue;
                }
                if ($scope.item[i].comments != undefined && $scope.item[i].comments.data.length >= 10) {
                  $scope.posts.push($scope.item[i].message);
                }
                if ($scope.item[i].likes != undefined && $scope.item[i].likes.data.length >= 10) {
                  $scope.posts.push($scope.item[i].message);
                }
                $scope.loading = false;
              }
              ;
              $scope.$apply();
            });
          }, { scope: 'read_stream' });
        }
      });
    };
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Configuring the Reflections module
angular.module('reflections').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Reflections', 'reflections', 'dropdown', '/reflections(/create)?');
    Menus.addSubMenuItem('topbar', 'reflections', 'All Reflections', 'reflections');
    Menus.addSubMenuItem('topbar', 'reflections', 'Create a Reflection', 'reflections/create');
  }
]);'use strict';
// Setting up route
angular.module('reflections').config([
  '$stateProvider',
  function ($stateProvider) {
    // Reflections state routing
    $stateProvider.state('listReflections', {
      url: '/reflections',
      templateUrl: 'modules/reflections/views/list-reflections.client.view.html'
    }).state('createReflection', {
      url: '/reflections/create',
      templateUrl: 'modules/reflections/views/create-reflection.client.view.html'
    }).state('viewReflection', {
      url: '/reflections/:reflectionId',
      templateUrl: 'modules/reflections/views/view-reflection.client.view.html'
    }).state('editReflection', {
      url: '/reflections/:reflectionId/edit',
      templateUrl: 'modules/reflections/views/edit-reflection.client.view.html'
    });
  }
]);'use strict';
angular.module('reflections').controller('ReflectionsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Reflections',
  'Comments',
  'Likes',
  'ReflectionUtilities',
  function ($scope, $stateParams, $location, Authentication, Reflections, Comments, Likes, ReflectionUtilities) {
    $scope.authentication = Authentication;
    $scope.content = ReflectionUtilities.getReflection();
    ReflectionUtilities.setReflection('');
    $scope.makeComment = false;
    $scope.toggleMakeComment = function () {
      $scope.makeComment = !$scope.makeComment;
    };
    $scope.shareToFacebook = function () {
      FB.init({
        appId: '639286812854499',
        xfbml: true,
        version: 'v2.1'
      });
      //Check User's log-in Status
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          var body = $scope.reflection.content;
          //Make post to Timeline
          FB.api('/me/feed', 'post', { message: body }, function (response) {
            if (!response || response.error) {
              alert('Please Connect To Facebook First!(Go to "Manage Social Accounts")');
            } else {
              alert('This Reflection Was Successfully Posted On Your Facebook Timeline!');
            }
          });
        } else {
          //Prompt User to get logged in.
          FB.login(function () {
            var body = $scope.reflection.content;
            //Make post to Timeline
            FB.api('/me/feed', 'post', { message: body }, function (response) {
              if (!response || response.error) {
                alert('Please Connect To Facebook First!(Go to "Manage Social Accounts")');
              } else {
                alert('This Reflection Was Successfully Posted On Your Facebook Timeline!');
              }
            });
          }, { scope: 'publish_actions' });
        }
      });
    };
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    // Create new Reflection
    $scope.create = function () {
      var reflection = new Reflections({
          title: this.title,
          content: this.content
        });
      reflection.$save(function (response) {
        $location.path('reflections/' + response._id);
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Create new Comment
    $scope.addComment = function () {
      var comment = new Comments({
          reflectionId: $scope.reflection._id,
          commentBody: this.comment
        });
      comment.$save(function (response) {
        $scope.reflection = response;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form field
      this.comment = '';
    };
    $scope.remove = function (reflection) {
      if (reflection) {
        reflection.$remove();
        for (var i in $scope.reflections) {
          if ($scope.reflections[i] === reflection) {
            $scope.reflections.splice(i, 1);
          }
        }
      } else {
        $scope.reflection.$remove(function () {
          $location.path('reflections');
        });
      }
    };
    $scope.update = function () {
      var reflection = $scope.reflection;
      reflection.$update(function () {
        $location.path('reflections/' + reflection._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.find = function () {
      $scope.reflections = Reflections.query();
    };
    $scope.findOne = function () {
      $scope.reflection = Reflections.get({ reflectionId: $stateParams.reflectionId });
    };
    //Like a Reflection
    $scope.likeReflection = function (reflection, value) {
      var user = $scope.authentication.user;
      if (user) {
        for (var i in $scope.reflections) {
          if ($scope.reflections[i]._id === reflection._id) {
            if (value === 1) {
              //Validate user (prevent a user from liking twice)
              for (var liked in reflection.likes) {
                if (reflection.likes[liked].user.toString() === user._id.toString()) {
                  reflection.likes.splice(liked, 1);
                  break;
                }
              }
              $scope.reflections[i].likes.push({
                reflectionId: 'reflectionid',
                user: user._id,
                like: 1
              });
            }
            //Decrement like(Unlike)
            if (value === -1) {
              for (var unlike in reflection.likes) {
                if (reflection.likes[unlike].user.toString() === user._id.toString()) {
                  reflection.likes.splice(unlike, 1);
                  break;
                }
              }
              $scope.reflections[i].likes.push({
                reflectionId: 'reflectionid',
                user: user._id,
                like: -1
              });
            }
          }
        }
      } else {
        $scope.voteMsg = 'Please sign up or sign in to like a reflection';
      }
      var like = new Likes({
          reflectionId: reflection._id,
          like: value
        });
      like.$save(function (response) {
        $scope.reflection = response;
      }, function (errorResponse) {
        $scope.likeError = errorResponse.data.message;
      });
    };
    //Evaluate Number of likes
    $scope.countLikes = function (reflection) {
      $scope.count = 0;
      for (var i = 0; i < reflection.likes.length; i++) {
        $scope.count = $scope.count + reflection.likes[i].like;
      }
      return $scope.count;
    };
  }
]);'use strict';
//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Comments', [
  '$resource',
  function ($resource) {
    return $resource('reflections/:reflectionId/comments/:commentId', {
      reflectionId: '@reflectionId',
      commentId: '@_id'
    });
  }
]);'use strict';
//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Likes', [
  '$resource',
  function ($resource) {
    return $resource('reflections/:reflectionId/likes/:id', {
      reflectionId: '@reflectionId',
      id: '@id'
    }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Reflections service used for communicating with the reflections REST endpoints
angular.module('reflections').factory('Reflections', [
  '$resource',
  function ($resource) {
    return $resource('reflections/:reflectionId', { reflectionId: '@_id' }, { update: { method: 'PUT' } });
  }
]).factory('ReflectionUtilities', function () {
  var Utils = {};
  Utils.setReflection = function (ref) {
    Utils.reflection = ref;
  };
  Utils.getReflection = function () {
    return Utils.reflection;
  };
  return Utils;
});'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/reflections');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);