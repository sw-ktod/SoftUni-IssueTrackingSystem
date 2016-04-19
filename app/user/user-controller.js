(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User', [])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/profile/password', {
                templateUrl: 'user/templates/user-edit-password.html',
                controller: 'userCtrl'
            }).when('/users', {
                templateUrl: 'user/templates/users-all.html',
                controller: 'userCtrl'
            })
            //.when('/profile', {
            //    templateUrl: 'user/templates/user-edit.html',
            //    controller: 'userCtrl',
            //    resolve:{
            //        auth: function(identificationFactory){
            //            identificationFactory.requireAuthorization();
            //        }
            //    }
            //})
        }])
        .controller('userCtrl',['$scope',
            '$location',
            'userFactory',
            'popService',
            function userCtrl($scope, $location, userFactory, popService) {
                /**
                 * Getting all users
                 */
                if($location.path() == '/users'){
                    identificationFactory.requireAdmin();
                    userFactory.getUsers()
                        .then(function (users) {
                            $scope.users = users;
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                    });
                }
                /**
                 * Editing user password
                 */
                else if($location.path() === '/users/profile/password'){
                    identificationFactory.requireAuthorization();

                    $scope.editPassword = editPassword;
                }
                /**
                 * Editing user
                 */
                //else if($location.path() === 'users/profile'){
                //    $scope.editUser = function (user) {
                //        userFactory.editUser(user)
                //            .then(function (response) {
                //                popService.pop(response.status, response.data.message);
                //            }, function (error) {
                //                var message = popService.getErrorMessage(error);
                //                popService.pop(error.status, message);
                //            });
                //    };
                //}

                function editPassword(userData){
                    userFactory.editPassword(userData)
                        .then(function (response) {
                            popService.pop(response.status, 'Successfully changed password');
                            $location.path('/');
                        }, function (error) {
                            var message = popService.getErrorMessage(error);
                            popService.pop(error.status, message);
                        });
                }

        }])
})();