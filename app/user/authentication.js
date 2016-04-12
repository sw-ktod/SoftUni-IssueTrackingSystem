(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User.Authentication', [])
        .factory('authService', ['$http',
            '$q',
            'BASE_URL',
            'identificationFactory',
            function ($http,$q, BASE_URL, identificationFactory) {

                function loginUser(user){
                    var deferred = $q.defer();
                    user['grant_type']='password';
                    $http.post(BASE_URL + 'api/token',
                        'grant_type=password&username=' + user.username + '&password=' + user.password,
                        {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }})
                        .then(function (response) {
                             deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function registerUser(user){
                    var deferred = $q.defer();
                    $http
                        .post(BASE_URL + 'api/account/register', user)
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;

                }
                function logOut(){
                    identificationFactory.requireAuthorization;
                    var deferred = $q.defer();
                    $http
                        .post(BASE_URL + 'api/account/logout')
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }

                return {
                    login : loginUser,
                    register : registerUser,
                    logout : logOut
                };
        }])
})();