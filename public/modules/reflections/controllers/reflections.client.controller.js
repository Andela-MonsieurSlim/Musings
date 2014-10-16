'use strict';

angular.module('reflections').controller('ReflectionsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Reflections', 'Comments', 'Likes', 'ReflectionUtilities',
	function($scope, $stateParams, $location, Authentication, Reflections, Comments, Likes, ReflectionUtilities) {
		$scope.authentication = Authentication;
		$scope.content = ReflectionUtilities.getReflection();
		ReflectionUtilities.setReflection("");
		$scope.makeComment = false;

		$scope.toggleMakeComment = function() {
			$scope.makeComment = !$scope.makeComment;
		};

		$scope.shareToFacebook = function() {
	        FB.init({
		        appId      : '639286812854499',
		        xfbml      : true,
		        version    : 'v2.1'
	        });
	        //Check User's log-in Status
	        FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					var body = $scope.reflection.content;
					//Make post to Timeline
					FB.api('/me/feed', 'post', { message: body }, function(response) {
						if (!response || response.error) {
					    	alert('Please Connect To Facebook First!(Go to "Manage Social Accounts")');
						} else {
					    	alert('This Reflection Was Successfully Posted On Your Facebook Timeline!');
						}
					});
				}
				else {
					//Prompt User to get logged in.
					FB.login(function(){
						var body = $scope.reflection.content;
						//Make post to Timeline
						FB.api('/me/feed', 'post', { message: body }, function(response) {
							if (!response || response.error) {
						    	alert('Please Connect To Facebook First!(Go to "Manage Social Accounts")');
							} else {
						    	alert('This Reflection Was Successfully Posted On Your Facebook Timeline!');
							}
						});
					}, {scope: 'publish_actions'});
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

		// Create new Reflection
		$scope.create = function() {
			var reflection = new Reflections({
				title: this.title,
				content: this.content
			});
			reflection.$save(function(response) {
				$location.path('reflections/' + response._id);
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Create new Comment
	    $scope.addComment = function() {
	      var comment = new Comments ({
	        reflectionId: $scope.reflection._id,
	        commentBody: this.comment
	      });

	      comment.$save(function(response) {
	          $scope.reflection = response;
	        }, function(errorResponse) {
	          $scope.error = errorResponse.data.message;
	      });
	      // Clear form field
	      this.comment = '';
	    };

		$scope.remove = function(reflection) {
			if (reflection) {
				reflection.$remove();

				for (var i in $scope.reflections) {
					if ($scope.reflections[i] === reflection) {
						$scope.reflections.splice(i, 1);
					}
				}
			} else {
				$scope.reflection.$remove(function() {
					$location.path('reflections');
				});
			}
		};

		$scope.update = function() {
			var reflection = $scope.reflection;

			reflection.$update(function() {
				$location.path('reflections/' + reflection._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.reflections = Reflections.query();
		};

		$scope.findOne = function() {
			$scope.reflection = Reflections.get({
				reflectionId: $stateParams.reflectionId
			});
		};

	    //Like a Reflection
	    $scope.likeReflection = function(reflection, value) {
	    	var user = $scope.authentication.user;
		        if(user) {
		            for(var i in $scope.reflections){
			            if($scope.reflections[i]._id === reflection._id){
			                if(value === 1) {
			                    //Validate user (prevent a user from liking twice)
			                    for(var liked in reflection.likes) {
				                    if(reflection.likes[liked].user.toString() === user._id.toString()) {
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
			                if(value === -1) {
			                    for(var unlike in reflection.likes) {
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
		        }else{     
		        	$scope.voteMsg = 'Please sign up or sign in to like a reflection';
		        }

	        var like = new Likes ({
		        reflectionId: reflection._id,
		        like: value
	        });

	        like.$save(function(response) {
	        	$scope.reflection = response;
	        },function(errorResponse) {
	            $scope.likeError = errorResponse.data.message;
	        });
	    };

	    //Evaluate Number of likes
	    $scope.countLikes = function(reflection) {
	    $scope.count = 0;
		    for(var i = 0; i < reflection.likes.length; i++){
		        $scope.count = $scope.count + reflection.likes[i].like;
		    }
		    return $scope.count;
	    };
	}
]);