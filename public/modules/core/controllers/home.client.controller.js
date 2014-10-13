'use strict';


angular.module('core').controller('HomeController', ['$http','$scope', 'Authentication', 'Reflections', 'Comments', 'Likes', 'ReflectionUtilities',
	function($http, $scope, Authentication, Reflections, Comments, Likes, ReflectionUtilities) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.welcomeMessage = new Date();
		$scope.items = [];
		$scope.posts = [];
		$scope.fillContent = function(post) {
			console.log("fillContent is running");
			ReflectionUtilities.setReflection(post);
		};

		window.fbAsyncInit = function() {
	        FB.init({
	          appId      : '477221335631523',
	          xfbml      : true,
	          version    : 'v2.1'
	        }),
	        
	        FB.getLoginStatus(function(response) {
	        	console.log(response);
				if (response.status === 'connected') {
				    console.log('Logged in.');
				    FB.api('/me/statuses?limit=100&format=json', function(response) {
				    	//operations on response data
				    	console.log(response);
				   		$scope.items.push(response.data);
				   		console.log($scope.items[0].length);
				   		$scope.item = $scope.items[0];
				   		console.log($scope.item);
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
				   		};
				   		console.log($scope.posts.length);
				   		console.log($scope.posts);
				   		$scope.$apply();	
					}); 
				   
				}
				else {
				    FB.login(function(){
				    	console.log('Logging in.');
					    FB.api('/me/statuses?limit=30&format=json', function(response) {
			      			//operations on response data
			      			console.log(response);
			      			$scope.items.push(response.data);
			      			console.log($scope.items[0].length);
					   		$scope.item = $scope.items[0];
					   		console.log($scope.item);
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
					   		};
					   		console.log($scope.posts.length);
					   		console.log($scope.posts);
					   		$scope.$apply();	
						});

					}, {scope: 'read_stream'});
				}

				console.log($scope.posts);
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