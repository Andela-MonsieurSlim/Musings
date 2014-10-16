'use strict';


angular.module('core').controller('HomeController', ['$http','$scope', 'Authentication', 'Reflections', 'Comments', 'Likes', 'ReflectionUtilities',
	function($http, $scope, Authentication, Reflections, Comments, Likes, ReflectionUtilities) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.welcomeMessage = new Date();
		$scope.items = [];
		$scope.posts = [];
		$scope.loading = false;

		$scope.postsRefresh = function() {
			location.reload();
			return false;
		};
		$scope.fillContent = function(post) {
			ReflectionUtilities.setReflection(post);
		};

		window.fbAsyncInit = function() {
			$scope.$apply($scope.loading = true);
	        FB.init({
		        appId      : '639286812854499',
		        xfbml      : true,
		        version    : 'v2.1'
	        });
	        //Check User's log-in Status
	        FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					//Retrieve Facebook Posts 
				    FB.api('/me/statuses?limit=100&format=json', function(response) {
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
							if($scope.item[i].likes != undefined && $scope.item[i].likes.data.length >= 10) {	
					   			$scope.posts.push($scope.item[i].message);					   						
				   			}
				   			$scope.loading = false;
				   		};
				   		$scope.$apply();	
					}); 
				}
				else {
					//Prompt User to get Logged In
				    FB.login(function(){
				    	//Retrieve Facebook Posts
					    FB.api('/me/statuses?limit=30&format=json', function(response) {
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
								if($scope.item[i].likes != undefined && $scope.item[i].likes.data.length >= 10) {	
						   			$scope.posts.push($scope.item[i].message);					   						
					   			}
					   			$scope.loading = false;
					   		};
					   		$scope.$apply();	
						});

					}, {scope: 'read_stream'});
				}
			});
		};

	    (function(d, s, id){
	         var js, fjs = d.getElementsByTagName(s)[0];
	         if (d.getElementById(id)) {return;}
	         js = d.createElement(s); js.id = id;
	         js.src = "//connect.facebook.net/en_US/sdk.js";
	         fjs.parentNode.insertBefore(js, fjs);
	    }(document, 'script', 'facebook-jssdk'));

}]);