(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User', [])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/profile', {
                templateUrl: 'user/templates/user-edit.html',
                controller: 'userCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
            }).when('/profile/password', {
                templateUrl: 'user/templates/user-edit-password.html',
                controller: 'userCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
            }).when('/users', {
                templateUrl: 'user/templates/users-all.html',
                controller: 'userCtrl',
                resolve:{
                    auth: function(identificationFactory){
                        identificationFactory.requireAuthorization();
                    }
                }
            })
        }])
        .controller('userCtrl',['$scope',
            '$location',
            'userFactory',
            'popService',
            function userCtrl($scope, $location, userFactory, popService) {

                if($location.path() == '/users'){
                    userFactory.getUsers()
                        .then(function (users) {
                            $scope.users = users;
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                }

                $scope.editUser = function (user) {
                    userFactory.editUser(user)
                        .then(function (response) {
                            popService.pop(response.status, response.data.message);
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                };
                $scope.editPassword = function (user) {
                    userFactory.editPassword(user)
                        .then(function (success) {
                            popService.pop(response.status, 'Successfully changed password');
                            $location.path('/');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                };
        }])
})();