(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User')
        .factory('userFactory', ['$q',
            '$http',
            'BASE_URL',
            function userFactory($q, $http, BASE_URL) {
                function getUsers(){
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'users')
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function editUser(user){
                    var deferred = $q.defer();
                    $http.put(BASE_URL + 'me', user)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function editPassword(user){
                    var deferred = $q.defer();
                    $http.post(BASE_URL + 'api/account/changePassword', user)
                        .then(function (response) {
                            deferred.resolve(response);
                        }, function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                }
                return {
                    editUser: editUser,
                    editPassword: editPassword,
                    getUsers: getUsers,
                }
        }])
})();