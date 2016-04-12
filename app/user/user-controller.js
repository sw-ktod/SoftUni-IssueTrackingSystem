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
        .directive('navMenu', ['identificationFactory',
            'authService',
            '$route',
            'popService',
            function navMenu(identificationFactory, authService, $route, popService) {
                return {
                    controller: ['$scope', function ($scope) {
                        $scope.logout = function () {
                            authService.logout()
                                .then(function (success) {
                                    identificationFactory.removeCookie();
                                    $route.reload();
                                    popService.pop(200, 'Successfully logged out');
                                }, function (error) {
                                    var message = popService.getErrorMessage(error);

                                    if(error.status == 401){
                                        identificationFactory.removeCookie();
                                        $route.reload();
                                    }
                                    popService.pop(error.status, message);
                                })
                        };
                    }],
                    compile: function () {
                        return {
                            pre: function(scope){
                                scope.userLogged = identificationFactory.userLogged();
                                scope.isAdmin = identificationFactory.isAdmin();
                            }
                        }
                    },
                    templateUrl: 'user/templates/user-nav.html'
                };
            }])
        .directive('userDashboard',['identificationFactory',
            function userDashboard(identificationFactory) {
                return {
                    templateUrl: 'user/templates/user-dashboard.html',
                    compile: function () {
                        return {
                            pre: function (scope) {
                                scope.userAdmin = identificationFactory.isAdmin();
                            }
                        }
                    }
                };
            }])
        .directive('userAuthentication',[
            function userAuthentication() {
                return {
                    templateUrl: 'user/templates/user-authentication.html'
                }
            }
        ])
})();