(function () {
    'use strict';

    angular.module('IssueTrackingSystem.User.Identification',[])
        .config(['$provide', '$httpProvider', function ($provide, $httpProvider) {
            $provide.factory('identificationInterceptor', ['$q', function ($q) {
                return {
                    request: function (config) {
                        var bearerToken = sessionStorage.getItem('access_token');
                        if (bearerToken) {
                            config.headers['Authorization'] = 'Bearer ' + bearerToken;
                        }

                        return config || $q.when(config);
                    }
                };
            }]);

            $httpProvider.interceptors.push('identificationInterceptor');
        }])
        .factory('identificationFactory', ['$window',
            '$location',
            'popService',
            '$http',
            '$q',
            'BASE_URL',
            function ($window, $location, popService, $http, $q, BASE_URL) {
                function setCookie(user){
                    $window.sessionStorage.access_token = user.access_token;
                    getSelf()
                        .then(function (response) {
                            $window.sessionStorage.user = JSON.stringify(response);
                        });
                }
                function existingCookie(){
                    return $window.sessionStorage.access_token ? 1 : 0;
                }
                function removeCookie(){
                    $window.sessionStorage.removeItem('access_token');
                    $window.sessionStorage.removeItem('user');
                }
                function requireAuthorization(){
                    if(!existingCookie()){
                        $location.path('/');
                        popService.pop(401, "You have to login first");
                        return;
                    }
                    //getSelf()
                    //    .then(function (self) {
                    //        return true;
                    //    }, function (error) {
                    //
                    //    });
                }
                function requireAdmin(){
                    if(!isAdmin()){
                        $location.path('/');
                        popService.pop(401, "Admin privileges required to access this page");
                        return;
                    }
                    //getSelf()
                    //    .then(function (self) {
                    //        return self.isAdmin;
                    //    }, function (error) {
                    //        $location.path('/');
                    //        popService.pop(401, "You have to login first");
                    //    });
                }
                function getSelf(){
                    var deferred = $q.defer();
                    $http.get(BASE_URL + 'users/me')
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }
                function isAdmin(){
                    if($window.sessionStorage.user){
                        return JSON.parse($window.sessionStorage.user).isAdmin;
                    }
                    return false
                }
                //
                //function isLead(project){
                //    getOwnId()
                //        .then(function (id) {
                //            return (project.data.Lead.Id === id);
                //        });
                //}
                //
                //function isAssignee(issue){
                //    getOwnId()
                //        .then(function (id) {
                //            return (issue.data.Assignee.Id == id);
                //        })
                //}


                //TODO fix getOwnId
                function getOwnId(){
                    var deferred = $q.defer();
                    getSelf()
                        .then(function (self) {
                            deferred.resolve(self.Id);
                        }, function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                }

                function getCookieData(key){
                    return $window.sessionStorage[key];
                }


                return {
                    setCookie: setCookie,
                    userLogged: existingCookie,
                    removeCookie: removeCookie,
                    requireAuthorization: requireAuthorization,
                    getOwnId: getOwnId,
                    requireAdmin: requireAdmin,
                    getUser: getSelf,
                    isAdmin: isAdmin
                }
            }])
})();